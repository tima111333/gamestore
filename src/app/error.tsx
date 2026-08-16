'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/layout/ErrorState'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app error]', error)
  }, [error])

  return (
    <ErrorState
      code={error.digest ? `Error · ${error.digest}` : 'Error'}
      title="Something broke"
      message="The page failed to render. Retrying usually clears it — the catalogue itself is served from a local fallback, so it should not be the data."
      onRetry={reset}
    />
  )
}
