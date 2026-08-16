import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Entrance animation for content that is already on screen at load.
 *
 * Unlike `Reveal` (IntersectionObserver, for anything below the fold), this is
 * a server component with a pure CSS animation: it starts on the first painted
 * frame instead of waiting for hydration. That distinction is what keeps hero
 * content out of the LCP critical path on slow devices.
 *
 * `variant="rise"` moves without fading — use it for the element most likely to
 * be the LCP candidate, since an opaque element counts as painted immediately.
 */
export function Enter({
  children,
  delay = 0,
  variant = 'fade',
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  /** Seconds. */
  delay?: number
  variant?: 'rise' | 'fade'
  className?: string
  as?: 'div' | 'p' | 'span' | 'li'
}) {
  return (
    <Tag
      className={cn(variant === 'rise' ? 'rise' : 'fade-rise', className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  )
}
