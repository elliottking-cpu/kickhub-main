// components/providers/GlobalProviders.tsx - Global app providers (Build Guide Step 2.4)
'use client'

import { RBACProvider } from './RBACProvider'

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <RBACProvider>
      {children}
    </RBACProvider>
  )
}