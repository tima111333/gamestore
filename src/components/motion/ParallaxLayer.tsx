'use client'

import { m, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

/**
 * Moves its children slower than the page as the section scrolls past.
 *
 * Uses Framer Motion's scroll progress — already in the bundle — instead of
 * pulling GSAP onto the home route. Animates `y` only, and
 * `MotionConfig reducedMotion="user"` neutralises it when asked.
 */
export function ParallaxLayer({
  children,
  className,
  speed = 0.18,
}: {
  children: ReactNode
  className?: string
  /** Fraction of the scrolled distance the layer travels. */
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`])

  return (
    <m.div ref={ref} className={className} style={{ y }}>
      {children}
    </m.div>
  )
}
