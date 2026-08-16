'use client'

import { AnimatePresence, m } from 'framer-motion'
import { useUI } from '@/store/ui'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

const DURATION = 0.75

/**
 * Flies a copy of the card art into the cart badge on add-to-cart.
 *
 * The clone is `position: fixed` and animated with transform + opacity only, so
 * it never touches layout. Under reduced motion nothing is rendered at all —
 * the cart counter update is feedback enough.
 */
export function CartFlight() {
  const flights = useUI((state) => state.flights)
  const endFlight = useUI((state) => state.endFlight)
  const reduced = usePrefersReducedMotion()

  if (reduced) return null

  return (
    <AnimatePresence>
      {flights.map((flight) => (
          <m.img
            key={flight.id}
            src={flight.image}
            alt=""
            aria-hidden="true"
            className="pointer-events-none fixed z-[75] object-cover"
            initial={{
              left: flight.from.x,
              top: flight.from.y,
              width: flight.from.width,
              height: flight.from.height,
              opacity: 0.95,
              scale: 1,
            }}
            animate={{
              x: flight.to.x - flight.from.x - flight.from.width / 2,
              y: flight.to.y - flight.from.y - flight.from.height / 2,
              scale: 0.06,
              opacity: 0.2,
            }}
            transition={{ duration: DURATION, ease: [0.66, 0, 0.34, 1] }}
            onAnimationComplete={() => endFlight(flight.id)}
          />
      ))}
    </AnimatePresence>
  )
}
