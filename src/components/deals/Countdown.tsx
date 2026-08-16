'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const pad = (value: number) => String(value).padStart(2, '0')

const parts = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    hours: pad(Math.floor(total / 3600)),
    minutes: pad(Math.floor((total % 3600) / 60)),
    seconds: pad(total % 60),
  }
}

/**
 * Ticks once per second against a server-provided deadline. Renders placeholders
 * until mounted so the server HTML and the first client paint always agree.
 */
export function Countdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const target = new Date(endsAt).getTime()
    const tick = () => setRemaining(target - Date.now())
    tick()

    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [endsAt])

  const time = remaining === null ? null : parts(remaining)
  const cells: Array<[string, string]> = [
    ['Hrs', time?.hours ?? '--'],
    ['Min', time?.minutes ?? '--'],
    ['Sec', time?.seconds ?? '--'],
  ]

  return (
    <div className={cn('flex items-end gap-2', className)}>
      {cells.map(([label, value], index) => (
        <div key={label} className="flex items-end gap-2">
          <div className="flex flex-col items-center gap-1">
            <span
              className="min-w-[2.5ch] bg-surface-2 px-2 py-1 text-center font-mono text-2xl font-bold tabular-nums text-fg sm:text-4xl"
              suppressHydrationWarning
            >
              {value}
            </span>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-fg-faint">
              {label}
            </span>
          </div>
          {index < cells.length - 1 && (
            <span className="pb-6 font-mono text-2xl text-fg-faint sm:text-4xl" aria-hidden="true">
              :
            </span>
          )}
        </div>
      ))}
      <span className="sr-only" aria-live="off">
        {time ? `${time.hours} hours ${time.minutes} minutes remaining` : 'Loading countdown'}
      </span>
    </div>
  )
}
