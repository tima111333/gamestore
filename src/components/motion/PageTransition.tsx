'use client'

import { m } from 'framer-motion'
import { useState, type ReactNode } from 'react'

/**
 * The very first paint should not be wiped — only route changes get a curtain.
 *
 * Module state, so it is per-tab on the client. On the server it must never be
 * consulted: module scope there is shared across requests, so the second render
 * would emit a curtain the hydrating client does not expect.
 */
let hasNavigated = false

/**
 * Route transition. `template.tsx` remounts this on every navigation, so the
 * enter animation runs without needing an exit hook.
 *
 * The wrapper animates opacity only — a lingering transform on a page-level
 * element would become the containing block for every `position: fixed` child
 * inside it (drawers, lightboxes). Movement lives in the curtain instead.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [showCurtain] = useState(() => {
    if (typeof window === 'undefined') return false
    const value = hasNavigated
    hasNavigated = true
    return value
  })

  return (
    <>
      {showCurtain && (
        <>
          <m.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[66] bg-void"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            style={{ transformOrigin: 'top', willChange: 'transform' }}
          />
          <m.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-[67] h-[2px] bg-acid"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            style={{ transformOrigin: 'right', willChange: 'transform' }}
          />
        </>
      )}

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: showCurtain ? 0.12 : 0 }}
      >
        {children}
      </m.div>
    </>
  )
}
