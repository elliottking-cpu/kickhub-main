// src/app/(parent)/parent/children/[childId]/page.tsx - Protected child management
import { RouteProtection } from '@/components/auth/RouteProtection'

interface ChildManagementPageProps {
  params: { childId: string }
}

// Placeholder child management component
function ChildManagement({ childId }: { childId: string }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Child Management - ID: {childId}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900">Loading...</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="text-gray-900">Loading...</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <p className="text-gray-900">Loading...</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-3">
              <p className="text-sm text-gray-600">Training Session</p>
              <p className="font-medium">Attended training on Monday</p>
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <p className="text-sm text-gray-600">Match Performance</p>
              <p className="font-medium">Scored 2 goals in last match</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Permissions & Privacy</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700">Photo consent</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700">Video consent</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700">Social media consent</span>
            </label>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Contact</label>
              <p className="text-gray-900">Loading...</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Phone</label>
              <p className="text-gray-900">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChildManagementPage({ params }: ChildManagementPageProps) {
  return (
    <RouteProtection
      requiredRoles={['parent', 'coach', 'assistant_coach']}
      requiredPermissions={['view_child_data']}
    >
      <ChildManagement childId={params.childId} />
    </RouteProtection>
  )
}
