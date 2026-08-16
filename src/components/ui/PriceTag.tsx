import { cn, finalPrice, formatPrice } from '@/lib/utils'

/**
 * Price block. When discounted it shows the struck original, the badge and the
 * new price — all in one line so cards keep a fixed height.
 */
export function PriceTag({
  price,
  discount,
  size = 'md',
  className,
}: {
  price: number
  discount: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const now = finalPrice(price, discount)
  const sizes = {
    sm: { now: 'text-sm', was: 'text-[0.625rem]', badge: 'text-[0.625rem] px-1.5 py-0.5' },
    md: { now: 'text-lg', was: 'text-xs', badge: 'text-[0.6875rem] px-2 py-1' },
    lg: { now: 'text-3xl', was: 'text-sm', badge: 'text-sm px-2.5 py-1' },
  }[size]

  return (
    <span className={cn('inline-flex items-baseline gap-2 font-mono', className)}>
      {discount > 0 && (
        <span className={cn('bg-hot font-bold leading-none text-on-accent', sizes.badge)}>
          −{discount}%
        </span>
      )}
      {discount > 0 && (
        <span className={cn('text-fg-faint line-through', sizes.was)}>{formatPrice(price)}</span>
      )}
      <span className={cn('font-bold leading-none text-fg', sizes.now)}>{formatPrice(now)}</span>
    </span>
  )
}
