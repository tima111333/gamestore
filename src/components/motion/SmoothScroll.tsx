'use client'

import type LenisType from 'lenis'
import { useEffect } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

let instance: LenisType | null = null

/** Lets scroll-bound effects sync with the smooth-scroll loop when one exists. */
export const getLenis = (): LenisType | null => instance

/**
 * Smooth scrolling, mounted once at the root.
 *
 * Lenis drives the real scroll position (not a transform), so anchors, sticky
 * elements and IntersectionObserver keep working. The library itself is
 * imported inside the effect — it is worth ~13 KB gzip and nothing on screen
 * depends on it, so it stays out of the first load.
 *
 * Skipped entirely when the visitor asks for reduced motion: native scrolling
 * is the honest answer there, not a slower animation.
 */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return

    let lenis: LenisType | null = null
    let cancelled = false

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return

      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        // Touch devices already have momentum scrolling; doubling it feels wrong.
        syncTouch: false,
        autoRaf: true,
      })
      instance = lenis
    })

    return () => {
      cancelled = true
      lenis?.destroy()
      instance = null
    }
  }, [reduced])

  return null
}
