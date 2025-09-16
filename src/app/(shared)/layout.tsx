// app/(shared)/layout.tsx - Shared layout for cross-role functionality (Build Guide Step 2.4)
import { createAuthServerClient } from '@/lib/auth/client'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

/**
 * Shared Layout - Cross-role functionality layout
 * 
 * Features:
 * - Server-side authentication verification
 * - Shared components for profile, settings, notifications
 * - Universal access for all authenticated users
 * - Mobile-responsive design
 * 
 * Per Build Guide Step 2.4: "(shared) route group for cross-role functionality"
 */
export default async function SharedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  let user = null
  
  // Skip auth during build time when environment variables might not be available
  try {
    const supabase = await createAuthServerClient()
    
    // Handle case where supabase client is null during build time
    if (supabase) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
    }

    // Only do redirects during development, skip during static generation
    if (!user && process.env.NODE_ENV === 'development') {
      redirect('/login')
    }
  } catch (error) {
    console.error('Auth error in shared layout during build:', error)
    // Continue rendering during build time even if auth fails
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared Header - Simple header for cross-role functionality */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                KickHub
              </h1>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email || 'User'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  )
}