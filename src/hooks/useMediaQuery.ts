'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * SSR-safe media query. `useSyncExternalStore` keeps the server snapshot
 * (`false`) and the live client value in sync without an effect, so there is no
 * hydration mismatch and no cascading render.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/** True only on devices with a real cursor — gates the custom cursor and tilt. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
