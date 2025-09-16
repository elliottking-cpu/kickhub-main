// src/app/unauthorized/page.tsx - Unauthorized access page
'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'

export default function UnauthorizedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { userRoles } = usePermissions()
  
  const reason = searchParams.get('reason')
  const message = searchParams.get('message')

  const getErrorMessage = () => {
    switch (reason) {
      case 'insufficient_permissions':
        return 'You don\'t have the required permissions to access this page.'
      case 'insufficient_roles':
        return 'You don\'t have the required role to access this page.'
      case 'not_authenticated':
        return 'You need to be logged in to access this page.'
      default:
        return message || 'You don\'t have permission to access this page.'
    }
  }

  const getSuggestedAction = () => {
    if (!user) {
      return {
        text: 'Please log in to continue',
        action: () => router.push('/login'),
        buttonText: 'Go to Login'
      }
    }

    // Suggest appropriate dashboard based on user's roles
    const primaryRole = userRoles[0]
    switch (primaryRole) {
      case 'coach':
      case 'assistant_coach':
        return {
          text: 'Go to your coach dashboard',
          action: () => router.push('/coach/dashboard'),
          buttonText: 'Coach Dashboard'
        }
      case 'parent':
        return {
          text: 'Go to your parent dashboard',
          action: () => router.push('/parent/dashboard'),
          buttonText: 'Parent Dashboard'
        }
      case 'player':
        return {
          text: 'Go to your player dashboard',
          action: () => router.push('/player/dashboard'),
          buttonText: 'Player Dashboard'
        }
      case 'fan':
        return {
          text: 'Go to your fan dashboard',
          action: () => router.push('/fan/dashboard'),
          buttonText: 'Fan Dashboard'
        }
      case 'referee':
        return {
          text: 'Go to your referee dashboard',
          action: () => router.push('/referee/dashboard'),
          buttonText: 'Referee Dashboard'
        }
      default:
        return {
          text: 'Complete your profile setup',
          action: () => router.push('/profile/setup'),
          buttonText: 'Profile Setup'
        }
    }
  }

  const suggestion = getSuggestedAction()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-500 mb-4">
            <svg
              className="h-full w-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage()}
          </p>

          {user && userRoles.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Your current roles:</strong>{' '}
                {userRoles.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={suggestion.action}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {suggestion.buttonText}
          </button>

          <button
            onClick={() => router.back()}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              {suggestion.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}