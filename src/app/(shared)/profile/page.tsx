// app/(shared)/profile/page.tsx - User profile management (Build Guide Step 2.4)
import { createAuthServerClient } from '@/lib/auth/client'
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile - KickHub",
  description: "Manage your profile information and account settings for all roles.",
}

/**
 * Profile Page - Cross-role profile management
 * 
 * Features:
 * - Universal profile editing for all user roles
 * - Role-specific information display
 * - Account security settings
 * 
 * Per Build Guide Step 2.4: "(shared) route group cross-role functionality"
 */
export default async function ProfilePage() {
  const supabase = await createAuthServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user roles for displaying role-specific information
  const userRoles = await getUserRoles(user?.id)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Profile Settings
          </h1>
          
          {/* Basic Profile Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {user?.email}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User ID
                  </label>
                  <div className="mt-1 text-sm text-gray-500 font-mono">
                    {user?.id}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Role Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Role Information
              </h2>
              
              <div className="bg-gray-50 rounded-md p-4">
                <div className="text-sm text-gray-600">
                  Your current roles: <span className="font-medium">{userRoles.join(', ')}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Role-based access control determines which features and data you can access.
                </div>
              </div>
            </div>
            
            {/* Account Security */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Account Security
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Last Sign In
                    </div>
                    <div className="text-sm text-gray-500">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Account Created
                    </div>
                    <div className="text-sm text-gray-500">
                      {user?.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get user roles (placeholder implementation)
async function getUserRoles(userId?: string): Promise<string[]> {
  // TODO: Replace with actual database query when schema is implemented in Step 3.1
  // For now, return placeholder roles based on email patterns
  return ['User'] // Placeholder
}