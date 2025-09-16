// app/500.tsx - Server error page
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Server Error
        </h1>
        
        <p className="text-gray-600 mb-6">
          We're experiencing some technical difficulties. Our team has been notified and is working to resolve the issue.
        </p>
        
        <div className="space-y-3">
          <Button onClick={() => window.location.reload()} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}