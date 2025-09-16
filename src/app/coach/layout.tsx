// app/coach/layout.tsx - Enhanced coach-specific layout with server-side auth (Build Guide Step 2.4)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CoachSidebar, MobileCoachNavigation } from '@/components/navigation/CoachSidebar'
import { CoachHeader } from '@/components/navigation/CoachHeader'
import { Suspense } from 'react'

/**
 * Coach Layout - Role-specific layout for coach interface with server-side authentication
 * 
 * Features:
 * - Server-side authentication and role verification
 * - Coach-specific sidebar navigation
 * - Contextual header with quick actions
 * - Mobile-responsive design
 * - Integration with RBAC system
 * 
 * Per Build Guide Step 2.4: Complete route group structure with role-specific layouts
 */
export default async function CoachLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Verify user has coach role (TODO: Replace with actual database query when schema is implemented in Step 3.1)
  // For now, using the same email-based logic as middleware for consistency
  const email = user.email || ''
  const hasCoachRole = email.includes('coach') || email.includes('admin') || 
    (!email.includes('parent') && !email.includes('player') && !email.includes('referee') && !email.includes('fan'))
  
  if (!hasCoachRole) {
    redirect('/unauthorized')
  }
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <CoachSidebar user={user} />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header with contextual actions */}
        <Suspense 
          fallback={
            <div className="h-20 bg-white border-b border-gray-200 animate-pulse" />
          }
        >
          <CoachHeader user={user} />
        </Suspense>
        
        {/* Page Content */}
        <div className="p-6 pb-20 md:pb-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileCoachNavigation user={user} />
    </div>
  )
}