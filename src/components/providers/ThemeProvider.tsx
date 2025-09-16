// components/providers/ThemeProvider.tsx - Theme management system (Build Guide Step 2.4)
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from 'next-themes'

/**
 * ThemeProvider Component - Dark/Light Mode Support
 * 
 * Wraps next-themes with KickHub-specific theme configuration.
 * Supports system preference detection and smooth theme transitions.
 * 
 * Per Build Guide Step 2.4: Theme provider for dark/light mode
 */
export function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      {...props}
      // Override default props with KickHub-specific settings
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="kickhub-theme"
      themes={['light', 'dark', 'system']}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  )
}

/**
 * Hook for theme management
 * Provides convenient access to theme state and controls
 */
export function useKickHubTheme() {
  const { theme, setTheme, resolvedTheme, themes } = useTheme()

  const toggleTheme = React.useCallback(() => {
    if (resolvedTheme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }, [resolvedTheme, setTheme])

  return {
    theme,
    setTheme,
    resolvedTheme,
    themes,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
  }
}