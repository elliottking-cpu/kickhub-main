// src/app/(multi-role)/team/[teamId]/page.tsx - Multi-role team page
import { RouteProtection } from '@/components/auth/RouteProtection'

interface TeamPageProps {
  params: { teamId: string }
}

// Placeholder team overview component
function TeamOverview({ teamId }: { teamId: string }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Team Overview - ID: {teamId}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Team Name</label>
                <p className="text-gray-900 font-medium">Loading...</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age Group</label>
                <p className="text-gray-900">Loading...</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">League</label>
                <p className="text-gray-900">Loading...</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Season</label>
                <p className="text-gray-900">2024/25</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">vs. Opponent Team</p>
                  <p className="text-sm text-gray-600">Last Saturday</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">3-1 Win</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">vs. Another Team</p>
                  <p className="text-sm text-gray-600">Two weeks ago</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">1-2 Loss</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upcoming Fixtures</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">vs. Next Opponent</p>
                  <p className="text-sm text-gray-600">This Saturday, 10:00 AM</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Home</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Matches Played</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wins</span>
                <span className="font-medium text-green-600">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Draws</span>
                <span className="font-medium text-yellow-600">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Losses</span>
                <span className="font-medium text-red-600">2</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Points</span>
                <span className="font-bold">26</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                View Squad
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Training Schedule
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                Team Messages
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Coaching Staff</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  JD
                </div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-600">Head Coach</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  JS
                </div>
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-gray-600">Assistant Coach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeamPage({ params }: TeamPageProps) {
  return (
    <RouteProtection
      requiredRoles={['coach', 'assistant_coach', 'parent', 'player']}
      requiredPermissions={['view_team_data']}
    >
      <TeamOverview teamId={params.teamId} />
    </RouteProtection>
  )
}
