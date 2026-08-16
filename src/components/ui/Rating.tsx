import { cn } from '@/lib/utils'
import { formatCount } from '@/lib/utils'

/**
 * Rating readout: a segmented bar plus the numeric score. The bar is decorative,
 * the accessible name carries the actual value.
 */
export function Rating({
  value,
  count,
  className,
  showCount = true,
}: {
  value: number
  count?: number
  className?: string
  showCount?: boolean
}) {
  const filled = Math.round(value)

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {/* `aria-label` is not allowed on a plain span, so the accessible text is
          a real (visually hidden) node and the graphics are hidden instead. */}
      <span className="sr-only">
        Rated {value.toFixed(1)} out of 5{count ? ` from ${count} players` : ''}
      </span>
      <span className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-3 w-[3px]',
              index < filled ? 'bg-acid' : 'bg-line-strong',
            )}
          />
        ))}
      </span>
      <span className="font-mono text-xs text-fg" aria-hidden="true">
        {value.toFixed(1)}
      </span>
      {showCount && count ? (
        <span className="font-mono text-[0.625rem] text-fg-faint" aria-hidden="true">
          ({formatCount(count)})
        </span>
      ) : null}
    </span>
  )
}

export function Metascore({ score, className }: { score: number; className?: string }) {
  const tone =
    score >= 85 ? 'bg-acid text-on-accent' : score >= 70 ? 'bg-surface-2 text-fg' : 'bg-hot text-on-accent'

  return (
    <span
      className={cn('inline-flex h-8 w-8 items-center justify-center font-mono text-sm', tone, className)}
      title="Metascore"
    >
      <span className="sr-only">Metascore:</span>
      {score}
    </span>
  )
}
