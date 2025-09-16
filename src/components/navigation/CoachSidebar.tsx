// components/navigation/CoachSidebar.tsx - Coach-specific sidebar navigation (Build Guide Step 2.4)
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRBAC } from '@/components/providers/RBACProvider'
import { Button } from '@/components/ui/button'
import {
  Home,
  Users,
  Calendar,
  Trophy,
  Target,
  MessageCircle,
  Bell,
  ShoppingBag,
  Shirt,
  CreditCard,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  ClipboardList,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface CoachSidebarProps {
  user?: User | null
}

export function CoachSidebar({ user }: CoachSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { hasPermission } = useRBAC()

  const navigationSections = [
    {
      title: 'Dashboard',
      items: [
        {
          name: 'Overview',
          href: '/coach/dashboard',
          icon: Home,
          description: 'Team overview and quick actions'
        }
      ]
    },
    {
      title: 'Team Management',
      items: [
        {
          name: 'Team Setup',
          href: '/coach/team/setup',
          icon: Users,
          description: 'Configure team details and settings'
        },
        {
          name: 'Players',
          href: '/coach/team/players',
          icon: Users,
          description: 'Manage player profiles and details'
        }
      ]
    }
  ]

  const isActiveLink = (href: string) => {
    if (href === '/coach/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={cn(
      "relative bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-white p-0 shadow-md hover:shadow-lg"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <div className="flex h-full flex-col">
        <div className="p-4 border-b border-gray-200">
          {!collapsed && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Coach Panel</h2>
              <p className="text-sm text-gray-600">Team Management</p>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    {section.title}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = isActiveLink(item.href)
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-gray-100 hover:text-gray-900",
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600"
                        )}
                        title={collapsed ? item.description : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <span className="ml-3 truncate">{item.name}</span>
                        )}
                        {isActive && !collapsed && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

interface MobileCoachNavigationProps {
  user?: User | null
}

export function MobileCoachNavigation({ user }: MobileCoachNavigationProps) {
  const pathname = usePathname()

  const quickLinks = [
    { name: 'Dashboard', href: '/coach/dashboard', icon: Home },
    { name: 'Matches', href: '/coach/matches', icon: Calendar },
    { name: 'Training', href: '/coach/training', icon: Target },
    { name: 'Messages', href: '/coach/messages', icon: MessageCircle },
    { name: 'Team', href: '/coach/team/players', icon: Users },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5">
        {quickLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center py-2 px-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="truncate">{link.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}