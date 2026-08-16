'use client'

import { useEffect, useRef } from 'react'

/**
 * Reading progress bar. Writes a transform straight to the DOM inside rAF —
 * no React state per scroll event, no layout thrash.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      bar.style.transform = `scaleX(${progress})`
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      className="fixed inset-x-0 top-0 z-[70] h-[2px] bg-transparent"
      role="presentation"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-acid"
        style={{ transform: 'scaleX(0)', willChange: 'transform' }}
      />
    </div>
  )
}
