// components/navigation/CoachHeader.tsx - Coach-specific header (Build Guide Step 2.4)
'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useRBAC } from '@/components/providers/RBACProvider'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Search,
  Plus,
  Calendar,
  Users,
  Trophy,
  Target,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Custom hook for user authentication with new Supabase client
function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return user
}

export function CoachHeader() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications] = useState(3) // Placeholder for notification count
  
  const pathname = usePathname()
  const user = useUser()
  const { userRoles } = useRBAC()

  // Get contextual quick actions based on current page
  const getQuickActions = () => {
    if (pathname.startsWith('/coach/matches')) {
      return [
        {
          label: 'New Match',
          href: '/coach/matches/create',
          icon: Plus,
          variant: 'default' as const
        },
        {
          label: 'Live Matches',
          href: '/coach/matches?filter=live',
          icon: Zap,
          variant: 'outline' as const
        }
      ]
    }

    if (pathname.startsWith('/coach/training')) {
      return [
        {
          label: 'New Session',
          href: '/coach/training/create',
          icon: Plus,
          variant: 'default' as const
        },
        {
          label: 'Drill Library',
          href: '/coach/training/drills',
          icon: Target,
          variant: 'outline' as const
        }
      ]
    }

    if (pathname.startsWith('/coach/team')) {
      return [
        {
          label: 'Add Player',
          href: '/coach/team/players/invite',
          icon: Plus,
          variant: 'default' as const
        },
        {
          label: 'Team Settings',
          href: '/coach/team/settings',
          icon: Settings,
          variant: 'outline' as const
        }
      ]
    }

    // Default quick actions
    return [
      {
        label: 'Quick Match',
        href: '/coach/matches/create',
        icon: Trophy,
        variant: 'outline' as const
      },
      {
        label: 'Training',
        href: '/coach/training/create',
        icon: Target,
        variant: 'outline' as const
      }
    ]
  }

  const quickActions = getQuickActions()

  // Get page title based on current route
  const getPageTitle = () => {
    if (pathname === '/coach/dashboard') return 'Dashboard'
    if (pathname.startsWith('/coach/matches')) return 'Matches'
    if (pathname.startsWith('/coach/training')) return 'Training'
    if (pathname.startsWith('/coach/team')) return 'Team Management'
    if (pathname.startsWith('/coach/messages')) return 'Messages'
    if (pathname.startsWith('/coach/finances')) return 'Finance'
    if (pathname.startsWith('/coach/referees')) return 'Referees'
    if (pathname.startsWith('/coach/volunteers')) return 'Volunteers'
    if (pathname.startsWith('/coach/fans')) return 'Fans'
    return 'Coach Panel'
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Page Title and Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <span>Coach Panel</span>
              <span className="mx-2">›</span>
              <span>{getPageTitle()}</span>
            </div>
          </div>
        </div>

        {/* Center Section - Quick Actions */}
        <div className="hidden md:flex items-center space-x-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                asChild
                className="h-9"
              >
                <a href={action.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {action.label}
                </a>
              </Button>
            )
          })}
        </div>

        {/* Right Section - Search, Notifications, User Menu */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(!searchOpen)}
              className="h-9 w-9 p-0"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            {searchOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setSearchOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-3">
                    <input
                      type="text"
                      placeholder="Search players, matches, training..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Search across your team data
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="h-9 w-9 p-0 relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Button>
            
            {notificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-3 border-b border-gray-200">
                    <div className="font-medium text-gray-900">Notifications</div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {/* Placeholder notifications */}
                    <div className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="text-sm font-medium text-gray-900">
                        Match reminder
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Brighton U12 vs Hove Rangers tomorrow at 10:00 AM
                      </div>
                    </div>
                    <div className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="text-sm font-medium text-gray-900">
                        New parent message
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Sarah Johnson sent a message about training
                      </div>
                    </div>
                    <div className="p-3 hover:bg-gray-50">
                      <div className="text-sm font-medium text-gray-900">
                        Payment received
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Monthly subscription from 3 parents
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <Button variant="ghost" size="sm" className="w-full text-sm">
                      View all notifications
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 px-3 h-9"
            >
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">
                  {user?.email?.charAt(0).toUpperCase() || 'C'}
                </span>
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-900">
                Coach
              </span>
              <ChevronDown className="h-3 w-3 text-gray-500" />
            </Button>

            {userMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-3 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.email}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {userRoles.join(', ')}
                    </div>
                  </div>
                  
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      asChild
                    >
                      <a href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                      </a>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      asChild
                    >
                      <a href="/coach/team/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Team Settings
                      </a>
                    </Button>
                    
                    <div className="border-t border-gray-200 my-1" />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}