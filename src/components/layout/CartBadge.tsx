'use client'

import Link from 'next/link'
import { m } from 'framer-motion'
import { useCart, cartCount } from '@/store/cart'

export function CartBadge() {
  const items = useCart((state) => state.items)
  const hydrated = useCart((state) => state.hydrated)
  const count = hydrated ? cartCount(items) : 0

  return (
    <Link
      href="/cart"
      id="cart-target"
      className="relative flex h-10 items-center gap-2 px-3 font-mono text-xs uppercase tracking-[0.18em] text-fg-muted transition-colors hover:text-fg"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M1 2h2.2l1.6 8.2h7.4L14 4.6H4.2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="square"
        />
        <circle cx="6" cy="13.2" r="1.1" fill="currentColor" />
        <circle cx="11.4" cy="13.2" r="1.1" fill="currentColor" />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      {/* Keyed by count so each change replays the pop. */}
      <m.span
        key={count}
        initial={{ scale: count > 0 ? 1.7 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 14 }}
        className="flex h-5 min-w-5 items-center justify-center bg-acid px-1 font-mono text-[0.625rem] font-bold text-on-accent"
        // Always hidden from assistive tech: the sr-only sentence below is the
        // accessible count, and reading both produced "Cart 0 0 items in cart".
        aria-hidden="true"
      >
        {count}
      </m.span>
      <span className="sr-only">{count === 1 ? '1 item in cart' : `${count} items in cart`}</span>
    </Link>
  )
}
