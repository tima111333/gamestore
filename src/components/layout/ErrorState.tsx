'use client'

import { Button, ButtonLink } from '@/components/ui/Button'

/** Shared body for every error.tsx boundary, so failures look designed. */
export function ErrorState({
  code = 'Error',
  title,
  message,
  onRetry,
}: {
  code?: string
  title: string
  message: string
  onRetry?: () => void
}) {
  return (
    <section className="mx-auto flex min-h-[70svh] w-full max-w-2xl flex-col items-start justify-center gap-6 px-4 py-32 sm:px-6">
      <span className="kicker">{code}</span>
      <h1 className="text-[clamp(3rem,10vw,7rem)] leading-[0.85] text-fg">{title}</h1>
      <p className="max-w-lg text-base leading-relaxed text-fg-muted">{message}</p>
      <div className="flex flex-wrap gap-3">
        {onRetry && (
          <Button size="lg" onClick={onRetry}>
            Try again
          </Button>
        )}
        <ButtonLink href="/" size="lg" variant="outline">
          Back to store
        </ButtonLink>
      </div>
    </section>
  )
}
