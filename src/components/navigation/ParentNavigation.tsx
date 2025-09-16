// src/components/navigation/ParentNavigation.tsx - Parent-specific navigation component
"use client"
import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'

export function ParentNavigation() {
  const { user } = useAuth()
  const { userRoles, hasRole } = usePermissions()
  
  // Helper functions
  const isParent = hasRole('parent' as any)
  const isCoach = hasRole('coach' as any)  
  const isAssistantCoach = hasRole('assistant_coach' as any)
  const hasMultipleRoles = userRoles.length > 1

  // Parent-specific navigation items
  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/parent/dashboard',
      icon: '🏠',
      description: 'Overview of your children\'s activities'
    },
    {
      label: 'My Children',
      href: '/parent/children',
      icon: '👶',
      description: 'Manage your children\'s profiles'
    },
    {
      label: 'Payments',
      href: '/parent/payments',
      icon: '💳',
      description: 'Handle team fees and purchases'
    },
    {
      label: 'Matches',
      href: '/parent/matches',
      icon: '⚽',
      description: 'View match schedules and results'
    },
    {
      label: 'Training',
      href: '/parent/training',
      icon: '🏃‍♂️',
      description: 'Training schedules and progress'
    },
    {
      label: 'Statistics',
      href: '/parent/stats',
      icon: '📊',
      description: 'Your children\'s performance stats'
    },
    {
      label: 'Communication',
      href: '/parent/messages',
      icon: '💬',
      description: 'Team communication and updates'
    },
    {
      label: 'Shop',
      href: '/parent/shop',
      icon: '🛒',
      description: 'Team kit and equipment'
    }
  ];

  // Quick actions for parents
  const quickActions = [
    {
      label: 'Pay Team Fees',
      href: '/parent/payments/fees',
      icon: '💰',
      variant: 'default' as const
    },
    {
      label: 'Update Availability',
      href: '/parent/availability',
      icon: '📅',
      variant: 'secondary' as const
    },
    {
      label: 'View Latest Match',
      href: '/parent/matches/latest',
      icon: '⚽',
      variant: 'secondary' as const
    }
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Role Indicator */}
          <div className="flex items-center space-x-4">
            <Link href="/parent" className="text-xl font-bold text-blue-600">
              KickHub
            </Link>
            
            {/* Role badge */}
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Parent
              </span>
              {hasMultipleRoles && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  +{userRoles.length - 1} more
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            {quickActions.slice(0, 2).map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                asChild
              >
                <Link href={action.href} className="flex items-center space-x-2">
                  <span>{action.icon}</span>
                  <span className="hidden md:inline">{action.label}</span>
                </Link>
              </Button>
            ))}
            
            {/* Profile dropdown trigger */}
            <div className="flex items-center space-x-2">
              <img
                src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
                alt="Profile"
                className="w-8 h-8 rounded-full border"
              />
              <span className="hidden lg:inline text-sm text-gray-700">
                {user?.email || 'Parent User'}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary navigation bar */}
        <div className="border-t border-gray-200">
          <div className="flex overflow-x-auto py-2 space-x-6">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors whitespace-nowrap"
                title={item.description}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile Parent Navigation Component
 * Optimized for smaller screens and touch interactions
 */
export function MobileParentNavigation() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)

  const navigationItems = [
    { label: 'Dashboard', href: '/parent/dashboard', icon: '🏠' },
    { label: 'Children', href: '/parent/children', icon: '👶' },
    { label: 'Payments', href: '/parent/payments', icon: '💳' },
    { label: 'Matches', href: '/parent/matches', icon: '⚽' },
    { label: 'Stats', href: '/parent/stats', icon: '📊' },
    { label: 'Messages', href: '/parent/messages', icon: '💬' }
  ];

  return (
    <div className="lg:hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/parent" className="text-lg font-bold text-blue-600">
          KickHub
        </Link>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 hover:text-blue-600"
          aria-label="Toggle navigation"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 py-2">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ParentNavigation
