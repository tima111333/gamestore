'use client'

import { m, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

const MAX_TILT = 8

/**
 * Cursor-driven 3D tilt with a glow that follows the pointer.
 *
 * Rotation runs through springs on `rotateX/rotateY` (transform only), and the
 * glow is a radial gradient whose centre is a motion value — no per-frame React
 * renders, no layout-affecting properties. Disabled outright on touch devices
 * and under reduced motion, where it would be a listener with no payoff.
 */
export function TiltCard({
  children,
  className,
  glow = true,
}: {
  children: ReactNode
  className?: string
  glow?: boolean
}) {
  // Both hooks must run every render — short-circuiting them would make the
  // second one conditional.
  const finePointer = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = finePointer && !reduced
  const ref = useRef<HTMLDivElement>(null)

  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20, mass: 0.5 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20, mass: 0.5 })
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)
  const glowOpacity = useSpring(useMotionValue(0), { stiffness: 180, damping: 24 })

  const background = useMotionTemplate`radial-gradient(220px circle at ${glowX}% ${glowY}%, color-mix(in srgb, var(--acid) 26%, transparent), transparent 70%)`

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    const node = ref.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height

    rotateY.set((px - 0.5) * 2 * MAX_TILT)
    rotateX.set((0.5 - py) * 2 * MAX_TILT)
    glowX.set(px * 100)
    glowY.set(py * 100)
  }

  const onEnter = () => enabled && glowOpacity.set(1)

  const onLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    glowOpacity.set(0)
  }

  if (!enabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div
      ref={ref}
      className={cn('relative', className)}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      onPointerMove={onPointerMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {children}
      {glow && (
        <m.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40 mix-blend-screen"
          style={{ background, opacity: glowOpacity }}
        />
      )}
    </m.div>
  )
}
