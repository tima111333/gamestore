'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/layout/ErrorState'

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[catalog]', error)
  }, [error])

  return (
    <ErrorState
      code="Catalog"
      title="Shelf collapsed"
      message="The catalogue could not be loaded. If a live API key is configured, the request may have timed out — retry to fall back to the offline catalogue."
      onRetry={reset}
    />
  )
}
