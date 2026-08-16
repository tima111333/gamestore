'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CatalogPage, Game } from '@/types/game'
import { GameCard } from '@/components/game/GameCard'
import { GameCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

/**
 * Owns everything past the server-rendered first page.
 *
 * The parent remounts this via `key={query}`, so a filter change resets the
 * accumulated pages without a single state-syncing effect.
 */
export function InfiniteGrid({
  initial,
  query,
  dimmed,
}: {
  initial: CatalogPage
  query: string
  dimmed: boolean
}) {
  const [extraPages, setExtraPages] = useState<Game[][]>([])
  const [page, setPage] = useState(initial.page)
  const [hasMore, setHasMore] = useState(initial.hasMore)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  const items = useMemo(() => {
    const seen = new Set<number>()
    return [initial.games, ...extraPages].flat().filter((game) => {
      if (seen.has(game.id)) return false
      seen.add(game.id)
      return true
    })
  }, [initial.games, extraPages])

  const sentinelRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setFailed(false)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const next = page + 1
      const response = await fetch(`/api/games?${query}${query ? '&' : ''}page=${next}`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = (await response.json()) as CatalogPage

      setExtraPages((pages) => [...pages, data.games])
      setPage(data.page)
      setHasMore(data.hasMore)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [hasMore, loading, page, query])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore()
      },
      { rootMargin: '500px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore, hasMore])

  useEffect(() => () => abortRef.current?.abort(), [])

  return (
    <>
      <ul
        className={cn(
          'grid grid-cols-2 gap-4 transition-opacity duration-200 md:grid-cols-3 md:gap-6 xl:grid-cols-4',
          dimmed && 'opacity-50',
        )}
      >
        {items.map((game, index) => (
          <li key={game.id}>
            {/* No `priority`: the heading is the LCP, and preloading a row of
                covers only delays the Suspense reveal. */}
            <GameCard game={game} index={index} />
          </li>
        ))}
        {loading &&
          Array.from({ length: 4 }, (_, index) => (
            <li key={`skeleton-${index}`}>
              <GameCardSkeleton />
            </li>
          ))}
      </ul>

      {failed && (
        <div className="mt-6 flex flex-col items-center gap-3 border border-line bg-surface p-6 text-center">
          <p className="text-sm text-fg-muted">Could not load more titles.</p>
          <Button variant="outline" size="sm" onClick={() => void loadMore()}>
            Retry
          </Button>
        </div>
      )}

      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center font-mono text-[0.625rem] uppercase tracking-[0.25em] text-fg-faint">
          End of catalogue
        </p>
      )}
    </>
  )
}
