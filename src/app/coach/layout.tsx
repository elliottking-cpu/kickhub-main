// app/coach/layout.tsx - Coach-specific layout (Build Guide Step 2.4)
import { CoachSidebar, MobileCoachNavigation } from '@/components/navigation/CoachSidebar'
import { Suspense } from 'react'

export default function CoachLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <CoachSidebar />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
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
      <MobileCoachNavigation />
    </div>
  )
}