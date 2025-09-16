// app/parent/layout.tsx - Parent-specific layout (Build Guide Step 2.4)
import { Suspense } from 'react'

export default function ParentLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
        <h1 className="text-xl font-semibold text-gray-900">Parent Dashboard</h1>
      </div>
      
      {/* Page Content */}
      <div className="p-6">
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
    </div>
  )
}