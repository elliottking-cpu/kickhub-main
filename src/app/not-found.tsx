// app/not-found.tsx - Global 404 page for Next.js 14 App Router (Build Guide Step 2.4)
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft, HelpCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="inline-flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 mb-4">
            <span className="text-4xl font-bold text-blue-600">404</span>
          </div>
          <div className="text-6xl font-extrabold text-gray-200 mb-4">
            Page Not Found
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! This page doesn&apos;t exist
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            The page you&apos;re looking for might have been moved, deleted, or you 
            may have typed the wrong URL.
          </p>
          <p className="text-sm text-gray-500">
            Don&apos;t worry, it happens to the best of us!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button asChild size="lg" className="min-w-40">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild size="lg" className="min-w-40">
            <Link href="/coach/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}