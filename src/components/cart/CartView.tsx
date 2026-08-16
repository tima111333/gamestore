'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart, cartCount, cartSavings, cartSubtotal } from '@/store/cart'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedNumber } from '@/components/motion/AnimatedNumber'
import { formatPrice } from '@/lib/utils'

export function CartView() {
  const items = useCart((state) => state.items)
  const hydrated = useCart((state) => state.hydrated)
  const setQuantity = useCart((state) => state.setQuantity)
  const remove = useCart((state) => state.remove)
  const clear = useCart((state) => state.clear)

  if (!hydrated) {
    return (
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6 border border-dashed border-line-strong px-6 py-20">
        <p className="font-display text-5xl uppercase">Cart is empty</p>
        <p className="max-w-md text-sm leading-relaxed text-fg-muted">
          Nothing queued yet. The catalogue is eighteen games deep and most of them are on sale.
        </p>
        <ButtonLink href="/catalog" size="lg">
          Browse catalog
        </ButtonLink>
      </div>
    )
  }

  const subtotal = cartSubtotal(items)
  const savings = cartSavings(items)
  const count = cartCount(items)

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
      <ul className="flex flex-col divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-6 sm:gap-6">
            <Link
              href={`/game/${item.slug}`}
              className="relative h-32 w-22 shrink-0 overflow-hidden border border-line bg-surface-2"
            >
              <Image
                src={item.cover}
                alt={`${item.title} cover`}
                fill
                sizes="88px"
                quality={70}
                className="object-cover"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <h2 className="truncate text-xl">
                  <Link href={`/game/${item.slug}`} className="transition-colors hover:text-acid-text">
                    {item.title}
                  </Link>
                </h2>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-fg-faint transition-colors hover:text-hot-text"
                  aria-label={`Remove ${item.title} from cart`}
                >
                  Remove
                </button>
              </div>

              {item.discount > 0 && (
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-hot-text">
                  −{item.discount}% applied
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center border border-line">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, item.quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center font-mono text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    aria-label={`Decrease quantity of ${item.title}`}
                  >
                    −
                  </button>
                  <span
                    className="flex h-9 w-10 items-center justify-center font-mono text-sm tabular-nums"
                    aria-label={`Quantity: ${item.quantity}`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, item.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center font-mono text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    aria-label={`Increase quantity of ${item.title}`}
                  >
                    +
                  </button>
                </div>

                <span className="font-mono text-lg font-bold tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="glass notch flex flex-col gap-5 p-6">
          <h2 className="font-display text-2xl uppercase">Summary</h2>

          <dl className="flex flex-col gap-3 border-y border-line py-4 font-mono text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-muted">Items</dt>
              <dd className="tabular-nums">{count}</dd>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-hot-text">
                <dt>You save</dt>
                <dd className="tabular-nums">−{formatPrice(savings)}</dd>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">
                <AnimatedNumber value={subtotal} duration={0.5} format={formatPrice} />
              </dd>
            </div>
          </dl>

          <Button size="lg" className="w-full" disabled>
            Checkout (demo)
          </Button>
          <p className="text-center font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-fg-faint">
            Front-end demo — no payments, no backend
          </p>

          <Button variant="ghost" size="sm" onClick={clear} className="self-center">
            Clear cart
          </Button>
        </div>
      </aside>
    </div>
  )
}
