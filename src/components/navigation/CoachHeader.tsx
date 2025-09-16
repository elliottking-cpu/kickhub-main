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
  User as UserIcon,
  LogOut,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CoachHeaderProps {
  user?: User | null
}

export function CoachHeader({ user: propUser }: CoachHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications] = useState(3)
  
  const pathname = usePathname()
  const { userRoles } = useRBAC()
  
  // Use prop user or fallback to hook
  const user = propUser

  const getPageTitle = () => {
    if (pathname === '/coach/dashboard') return 'Dashboard'
    if (pathname.startsWith('/coach/matches')) return 'Matches'
    if (pathname.startsWith('/coach/training')) return 'Training'
    if (pathname.startsWith('/coach/team')) return 'Team Management'
    return 'Coach Panel'
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
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

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
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
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}