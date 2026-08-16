'use client'

import { m } from 'framer-motion'
import type { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const OFFSETS: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 28 },
  right: { x: -28 },
  none: {},
}

/**
 * Reveals its children the first time they enter the viewport.
 *
 * Driven by IntersectionObserver rather than scroll position, so nothing runs
 * on the main thread between reveals. Only opacity and transform animate, and
 * `MotionConfig reducedMotion="user"` upstream strips the movement when asked.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className,
  as = 'div',
}: {
  children: ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 })
  // The polymorphic lookup widens the ref to an intersection of every element
  // type; one cast keeps the call sites simple without loosening their props.
  const Component = m[as] as typeof m.div

  return (
    <Component
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...OFFSETS[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  )
}

/** Staggers a list of children through the same reveal. */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  stagger?: number
  as?: 'div' | 'ul' | 'section'
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.08 })
  const Component = m[as] as typeof m.div

  return (
    <Component
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'shown' : 'hidden'}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </Component>
  )
}

export const revealItem = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
}
