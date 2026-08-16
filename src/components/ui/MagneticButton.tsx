'use client'

import Link from 'next/link'
import { m, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ComponentProps, type ReactNode } from 'react'
import { buttonStyles, type ButtonSize, type ButtonVariant } from '@/components/ui/Button'
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery'

const STRENGTH = 0.35
const RANGE = 90

// Hoisted: creating this inside a component would remount the link every render.
const MotionLink = m.create(Link)

/**
 * Pulls toward the cursor when it comes close, springs back on exit.
 *
 * Only wired up for fine pointers with motion allowed; everywhere else this is
 * an ordinary link with no listeners attached.
 */
function useMagnet(enabled: boolean) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })
  const ref = useRef<HTMLElement>(null)

  const onPointerMove = (event: React.PointerEvent) => {
    if (!enabled) return
    const node = ref.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const distance = Math.hypot(dx, dy)
    if (distance > RANGE + Math.max(rect.width, rect.height) / 2) return

    x.set(dx * STRENGTH)
    y.set(dy * STRENGTH)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return { ref, springX, springY, onPointerMove, reset }
}

/** React's drag/animation handlers collide with Framer's own; drop them. */
type MotionSafe<T> = Omit<
  T,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'style'
>

interface MagneticLinkProps extends MotionSafe<ComponentProps<typeof Link>> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export function MagneticLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: MagneticLinkProps) {
  const finePointer = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const { ref, springX, springY, onPointerMove, reset } = useMagnet(finePointer && !reduced)

  return (
    <MotionLink
      ref={ref as React.Ref<HTMLAnchorElement>}
      className={buttonStyles(variant, size, className)}
      style={{ x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      {...props}
    >
      {children}
    </MotionLink>
  )
}

interface MagneticButtonProps extends MotionSafe<ComponentProps<'button'>> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export function MagneticButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: MagneticButtonProps) {
  const finePointer = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const { ref, springX, springY, onPointerMove, reset } = useMagnet(finePointer && !reduced)

  return (
    <m.button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={buttonStyles(variant, size, className)}
      style={{ x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      {...props}
    >
      {children}
    </m.button>
  )
}
