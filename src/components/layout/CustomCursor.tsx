'use client'

import { useEffect, useRef } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery'

const INTERACTIVE = 'a, button, input, select, textarea, [role="button"], label'

/**
 * Desktop-only cursor: a dot that tracks exactly and a ring that lags behind.
 *
 * Positions are written straight to the DOM inside a single rAF loop — no React
 * state per mouse move — and the whole component is skipped on touch devices
 * and under reduced motion, where a fake cursor is pure cost.
 */
export function CustomCursor() {
  const finePointer = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!finePointer || reduced) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let ringX = targetX
    let ringY = targetY
    let frame = 0
    let visible = false

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      if (!visible) {
        visible = true
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
    }

    const onOver = (event: PointerEvent) => {
      const hit = (event.target as Element | null)?.closest?.(INTERACTIVE)
      ring.dataset.active = hit ? 'true' : 'false'
    }

    const onLeave = () => {
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    const onDown = () => {
      ring.dataset.pressed = 'true'
    }
    const onUp = () => {
      ring.dataset.pressed = 'false'
    }

    const loop = () => {
      // Exponential smoothing: the ring chases the dot, framerate-independent.
      ringX += (targetX - ringX) * 0.18
      ringY += (targetY - ringY) * 0.18
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    document.documentElement.classList.add('has-custom-cursor')

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [finePointer, reduced])

  if (!finePointer || reduced) return null

  return (
    <div aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" data-active="false" data-pressed="false" />
    </div>
  )
}
