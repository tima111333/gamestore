'use client'

import { animate, useMotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/**
 * Counts up to `value` when it scrolls into view, and re-runs whenever the
 * value changes afterwards. The text is written directly to the node, so a
 * running count costs zero React renders.
 */
export function AnimatedNumber({
  value,
  duration = 1.1,
  format = (n: number) => Math.round(n).toString(),
  className,
}: {
  value: number
  duration?: number
  format?: (value: number) => string
  className?: string
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 })
  const nodeRef = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    if (reduced || !inView) {
      if (reduced) node.textContent = format(value)
      return
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest)
      },
    })

    return () => controls.stop()
  }, [inView, value, duration, format, motionValue, reduced])

  return (
    <span ref={ref} className={className}>
      {/* Server render carries the final value so it is correct without JS. */}
      <span ref={nodeRef} suppressHydrationWarning>
        {format(value)}
      </span>
    </span>
  )
}
