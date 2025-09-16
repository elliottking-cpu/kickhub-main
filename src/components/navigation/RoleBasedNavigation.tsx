// src/components/navigation/RoleBasedNavigation.tsx - Multi-role navigation
import React from 'react'
import Link from 'next/link'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/hooks/useAuth'

export function RoleBasedNavigation() {
  const { user } = useAuth()
  const { 
    isCoach, 
    isAssistantCoach, 
    isParent, 
    isPlayer, 
    isFan, 
    isReferee,
    hasMultipleRoles,
    permissions 
  } = usePermissions()

  // Role checking integration for navigation items
  const hasRole = (role: string) => {
    return isCoach || isAssistantCoach || isParent || isPlayer || isFan || isReferee
  }

  const navigationItems = []

  // Coach/Assistant Coach Navigation
  if (isCoach || isAssistantCoach) {
    navigationItems.push({
      label: 'Coach Dashboard',
      href: '/coach/dashboard',
      icon: '🏆',
      roles: ['coach', 'assistant_coach']
    })
    navigationItems.push({
      label: 'Team Management',
      href: '/coach/team',
      icon: '👥',
      roles: ['coach', 'assistant_coach']
    })
    navigationItems.push({
      label: 'Match Management',
      href: '/coach/matches',
      icon: '⚽',
      roles: ['coach', 'assistant_coach']
    })
  }

  // Parent Navigation
  if (isParent) {
    navigationItems.push({
      label: 'Parent Dashboard',
      href: '/parent/dashboard',
      icon: '👨‍👩‍👧‍👦',
      roles: ['parent']
    })
    navigationItems.push({
      label: 'My Children',
      href: '/parent/children',
      icon: '👶',
      roles: ['parent']
    })
  }

  // Player Navigation
  if (isPlayer) {
    navigationItems.push({
      label: 'Player Dashboard',
      href: '/player/dashboard',
      icon: '🎮',
      roles: ['player']
    })
    navigationItems.push({
      label: 'My Stats',
      href: '/player/stats',
      icon: '📊',
      roles: ['player']
    })
  }

  // Fan Navigation
  if (isFan) {
    navigationItems.push({
      label: 'Fan Dashboard',
      href: '/fan/dashboard',
      icon: '🎉',
      roles: ['fan']
    })
  }

  // Referee Navigation
  if (isReferee) {
    navigationItems.push({
      label: 'Referee Dashboard',
      href: '/referee/dashboard',
      icon: '🟨',
      roles: ['referee']
    })
  }

  // Shared/Multi-role Navigation
  if (permissions?.activeTeams.length > 0) {
    navigationItems.push({
      label: 'Team Calendar',
      href: '/calendar',
      icon: '📅',
      roles: ['coach', 'assistant_coach', 'parent', 'player']
    })
    navigationItems.push({
      label: 'Messages',
      href: '/messages',
      icon: '💬',
      roles: ['coach', 'assistant_coach', 'parent']
    })
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              KickHub
            </Link>
            
            {/* Multi-role indicator */}
            {hasMultipleRoles && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full">
                <span className="text-sm text-blue-800">Multiple Roles</span>
                <div className="flex space-x-1">
                  {permissions?.roles.map((role, index) => (
                    <span
                      key={index}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      title={role.role}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span>{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-2">
              <img
                src={user?.profile_photo_url || '/default-avatar.png'}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:inline text-sm text-gray-700">
                {user?.full_name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

