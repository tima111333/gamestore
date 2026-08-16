import Link from 'next/link'
import { cn } from '@/lib/utils'

/** The house logotype: heavy display caps with a live acid dot. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="VOLTA home"
      className={cn('group inline-flex items-baseline gap-1', className)}
    >
      <span className="font-display text-2xl leading-none tracking-[0.06em] text-fg">VOLTA</span>
      <span className="relative block h-1.5 w-1.5 bg-acid transition-transform duration-300 group-hover:scale-150" />
    </Link>
  )
}
