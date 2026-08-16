import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type Tone = 'default' | 'acid' | 'hot' | 'outline'

const tones: Record<Tone, string> = {
  default: 'bg-surface-2 text-fg-muted',
  acid: 'bg-acid text-on-accent',
  hot: 'bg-hot text-on-accent',
  outline: 'border border-line-strong text-fg-muted',
}

export function Tag({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 font-mono text-[0.625rem] uppercase leading-none tracking-[0.16em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
