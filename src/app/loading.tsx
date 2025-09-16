// app/loading.tsx - Global loading UI for Next.js 14 App Router (Build Guide Step 2.4)
import { Loader2 } from 'lucide-react'

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">KH</span>
        </div>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">
            Loading KickHub...
          </span>
        </div>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Preparing your team management experience
        </p>
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}