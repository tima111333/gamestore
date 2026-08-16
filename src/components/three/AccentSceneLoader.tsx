'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useFinePointer, useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/**
 * Gate in front of the only three.js scene in the project.
 *
 * The bundle (~150 KB gzip of three + fiber) is fetched only when the visitor
 * is on a wide screen, with a real cursor, has not asked for reduced motion,
 * has WebGL, and the browser is idle. Everything else never downloads it.
 */
const AccentScene = dynamic(() => import('@/components/three/AccentScene'), {
  ssr: false,
  loading: () => null,
})

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function AccentSceneLoader({ className }: { className?: string }) {
  const wide = useMediaQuery('(min-width: 1024px)')
  const finePointer = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const [ready, setReady] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const [onScreen, setOnScreen] = useState(true)

  const eligible = wide && finePointer && !reduced

  useEffect(() => {
    if (!eligible || !hasWebGL()) return

    // Never compete with the hero video and first paint for bandwidth.
    const idle = window.requestIdleCallback?.(() => setReady(true), { timeout: 4000 })
    const timer = idle === undefined ? window.setTimeout(() => setReady(true), 2000) : undefined

    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [eligible])

  // Unmount the canvas when the hero scrolls away: no render loop off-screen.
  useEffect(() => {
    const node = hostRef.current
    if (!node || !ready) return

    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0.05,
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ready])

  if (!eligible) return null

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      {ready && onScreen && <AccentScene />}
    </div>
  )
}
