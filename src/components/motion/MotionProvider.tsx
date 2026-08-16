'use client'

import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { CartFlight } from '@/components/motion/CartFlight'
import { CustomCursor } from '@/components/layout/CustomCursor'

/**
 * One motion root for the app.
 *
 * `reducedMotion="user"` is the important bit: every Framer animation in the
 * tree drops its transform/layout movement when the OS asks for reduced motion,
 * without a single per-component check.
 *
 * `LazyMotion` + `domAnimation` ships the animation/variant/gesture features we
 * actually use instead of the full component; `strict` makes the bundle win
 * enforceable by throwing if anyone imports the heavyweight `motion` component.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <SmoothScroll />
        {children}
        <CartFlight />
        <CustomCursor />
      </MotionConfig>
    </LazyMotion>
  )
}
