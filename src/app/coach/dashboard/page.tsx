// src/app/coach/dashboard/page.tsx - Protected coach dashboard
import type { Metadata } from "next";
import { RouteProtection } from '@/components/auth/RouteProtection'

export const metadata: Metadata = {
  title: "Coach Dashboard - KickHub",
  description: "Main coach dashboard for team management",
};

// Placeholder coach dashboard component
function CoachDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Coach Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
          <p className="text-gray-600">Manage your team and view key statistics.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
          <p className="text-gray-600">View and manage upcoming fixtures.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Training Sessions</h2>
          <p className="text-gray-600">Schedule and track training activities.</p>
        </div>
      </div>
    </div>
  )
}

// Fallback component for unauthorized access
function CoachAccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <div className="mx-auto h-16 w-16 text-red-500 mb-4">
          <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Coach Access Required</h1>
        <p className="text-gray-600 mb-6">
          You need coach or assistant coach permissions to access this dashboard.
        </p>
        <p className="text-sm text-gray-500">
          If you believe this is an error, please contact your team administrator.
        </p>
      </div>
    </div>
  )
}

export default function CoachDashboardPage() {
  return (
    <RouteProtection
      requiredRoles={['coach', 'assistant_coach']}
      fallbackComponent={<CoachAccessDenied />}
    >
      <CoachDashboard />
    </RouteProtection>
  )
}