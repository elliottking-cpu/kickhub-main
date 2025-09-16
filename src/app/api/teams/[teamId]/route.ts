// src/app/api/teams/[teamId]/route.ts - Protected API route
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UnifiedPermissionSystem } from '@/lib/auth/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    // Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions
    const permissionSystem = new UnifiedPermissionSystem({
      userId: user.id,
      roles: ['parent'], // This would be fetched from database
      teamIds: [params.teamId]
    })
    const hasAccess = permissionSystem.hasPermission('team', 'view', { teamId: params.teamId })

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Fetch team data with RLS automatically applied
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', params.teamId)
      .single()

    if (teamError) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check management permissions
    const permissionSystem = new UnifiedPermissionSystem({
      userId: user.id,
      roles: ['coach'], // This would be fetched from database
      teamIds: [params.teamId]
    })
    const canManage = permissionSystem.hasPermission('team', 'manage', { teamId: params.teamId })

    if (!canManage) {
      return NextResponse.json(
        { error: 'Team management permissions required' },
        { status: 403 }
      )
    }

    const updates = await request.json()

    // Update team with RLS automatically applied
    const { data: team, error: updateError } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', params.teamId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 400 }
      )
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

