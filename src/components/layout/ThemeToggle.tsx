'use client'

import { useEffect } from 'react'
import { useUI, readInitialTheme } from '@/store/ui'
import { cn } from '@/lib/utils'

/**
 * Dark is the default; this only mirrors what the blocking head script already
 * applied, then lets the user flip it.
 */
export function ThemeToggle() {
  const theme = useUI((state) => state.theme)
  const ready = useUI((state) => state.themeReady)
  const setTheme = useUI((state) => state.setTheme)
  const toggleTheme = useUI((state) => state.toggleTheme)

  useEffect(() => {
    if (!ready) setTheme(readInitialTheme())
  }, [ready, setTheme])

  const isLight = ready && theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group flex h-10 w-10 items-center justify-center text-fg-muted transition-colors hover:text-fg"
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Dark theme' : 'Light theme'}
    >
      <span className="relative block h-4 w-4">
        {/* Sun */}
        <span
          className={cn(
            'absolute inset-0 rounded-full border-2 border-current transition-all duration-300',
            isLight ? 'scale-75 opacity-100' : 'scale-0 opacity-0',
          )}
        />
        {/* Moon */}
        <span
          className={cn(
            'absolute inset-0 rounded-full border-2 border-current transition-all duration-300',
            isLight ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
          )}
          style={{ clipPath: isLight ? undefined : 'inset(0 0 0 35%)' }}
        />
      </span>
    </button>
  )
}
