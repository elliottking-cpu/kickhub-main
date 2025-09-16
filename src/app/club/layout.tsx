// app/club/layout.tsx - Enhanced club-specific layout with server-side auth (Build Guide Step 2.4)
import { createAuthServerClient } from '@/lib/auth/client'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

/**
 * Club Layout - Role-specific layout for club administration with server-side authentication
 * 
 * Features:
 * - Server-side authentication and role verification
 * - Club-level administration interface
 * - Multi-team management capabilities
 * - Financial oversight and reporting
 * - Integration with RBAC system
 * 
 * Per Build Guide Step 2.4: Complete route group structure with role-specific layouts
 */
export default async function ClubLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const supabase = await createAuthServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Verify user has club admin role (TODO: Replace with actual database query when schema is implemented in Step 3.1)
  // For now, using the same email-based logic as middleware for consistency
  const email = user.email || ''
  const hasClubRole = email.includes('club') || email.includes('admin') || 
    (!email.includes('coach') && !email.includes('parent') && !email.includes('player') && !email.includes('referee') && !email.includes('fan'))
  
  if (!hasClubRole) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Club Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚽</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Club Administration
              </h1>
            </div>
            
            {/* Club Info */}
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  Club Admin
                </div>
                <div className="text-gray-600">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  )
}