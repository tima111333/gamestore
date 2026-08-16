'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/layout/ErrorState'

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[game]', error)
  }, [error])

  return (
    <ErrorState
      code="Game"
      title="Page jammed"
      message="This title's page failed to load. Retry, or head back to the catalogue and pick another shelf."
      onRetry={reset}
    />
  )
}
