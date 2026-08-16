'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { CatalogFilters, CatalogPage } from '@/types/game'
import { DEFAULT_FILTERS, SORT_OPTIONS, countActiveFilters, serializeFilters } from '@/lib/filters'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { FiltersPanel } from '@/components/catalog/FiltersPanel'
import { InfiniteGrid } from '@/components/catalog/InfiniteGrid'
import { AnimatedNumber } from '@/components/motion/AnimatedNumber'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props {
  initial: CatalogPage
  filters: CatalogFilters
  genres: Array<{ name: string; count: number }>
}

export function CatalogView({ initial, filters: serverFilters, genres }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  // Search is typed at full speed and debounced into the filter set; everything
  // else applies immediately. Filters are derived, never synced in an effect.
  const [draft, setDraft] = useState<CatalogFilters>(serverFilters)
  const [searchInput, setSearchInput] = useState(serverFilters.search)
  const debouncedSearch = useDebouncedValue(searchInput, 350)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const drawerRef = useFocusTrap<HTMLDivElement>(drawerOpen, closeDrawer)

  const filters = useMemo<CatalogFilters>(
    () => ({ ...draft, search: debouncedSearch }),
    [draft, debouncedSearch],
  )

  const activeCount = countActiveFilters(filters)
  const query = useMemo(() => serializeFilters(filters).toString(), [filters])

  // Filters live in the URL: every view is linkable and survives a reload.
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }, [query, pathname, router])

  const patch = (next: Partial<CatalogFilters>) => setDraft((current) => ({ ...current, ...next }))

  const reset = () => {
    setSearchInput('')
    setDraft(DEFAULT_FILTERS)
  }

  const panel = (
    <FiltersPanel
      filters={filters}
      genres={genres}
      onChange={patch}
      onReset={reset}
      activeCount={activeCount}
    />
  )

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
      <aside className="hidden lg:block">
        {/* The panel is taller than the viewport, so a bare `sticky` still let
            it scroll away and slide under the translucent header. Capping the
            height keeps it pinned and moves the overflow inside. */}
        <div className="sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto pr-2 [scrollbar-width:thin]">
          {panel}
        </div>
      </aside>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="catalog-search" className="sr-only">
              Search games
            </label>
            <input
              id="catalog-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title, genre, studio…"
              className="h-12 w-full border border-line bg-surface px-4 pr-10 font-mono text-sm text-fg placeholder:text-fg-faint focus:border-acid focus:outline-none"
            />
            <span
              className={cn(
                'absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 bg-acid transition-opacity duration-200',
                pending ? 'opacity-100' : 'opacity-0',
              )}
              aria-hidden="true"
            />
          </div>

          {/* `min-w-0` on the select: a flex item will not shrink below its
              content by default, and the longest option pushed this row 40px
              past a 360px viewport. */}
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="catalog-sort" className="kicker shrink-0">
              Sort
            </label>
            <select
              id="catalog-sort"
              value={filters.sort}
              onChange={(event) => patch({ sort: event.target.value as CatalogFilters['sort'] })}
              className="h-12 min-w-0 flex-1 border border-line bg-surface px-3 font-mono text-xs uppercase tracking-[0.14em] text-fg focus:border-acid focus:outline-none sm:flex-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="md"
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
            >
              Filters{activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>
          </div>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.18em] text-fg-faint" aria-live="polite">
          <AnimatedNumber value={initial.total} duration={0.6} className="text-fg" />{' '}
          {initial.total === 1 ? 'title' : 'titles'}
          {activeCount > 0 ? ' · filtered' : ''}
        </p>

        {initial.total === 0 ? (
          <EmptyState onReset={reset} />
        ) : (
          <InfiniteGrid key={query} initial={initial} query={query} dimmed={pending} />
        )}
      </div>

      {drawerOpen && (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-[70] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <button
            type="button"
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-label="Close filters"
          />
          <div className="absolute inset-y-0 right-0 w-[min(88vw,340px)] overflow-y-auto border-l border-line bg-void p-6">
            {panel}
            <Button className="mt-8 w-full" onClick={() => setDrawerOpen(false)}>
              Show {initial.total} results
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 border border-dashed border-line-strong px-6 py-20 text-center">
      <p className="font-display text-4xl uppercase text-fg">Nothing matches</p>
      <p className="max-w-sm text-sm text-fg-muted">
        No titles fit that combination. Loosen a filter, or clear them all and start over.
      </p>
      <Button variant="outline" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  )
}
