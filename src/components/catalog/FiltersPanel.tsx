'use client'

import { useId } from 'react'
import type { CatalogFilters, Platform } from '@/types/game'
import { PLATFORMS } from '@/types/game'
import { MAX_PRICE } from '@/lib/filters'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const RATINGS = [
  { value: 0, label: 'Any' },
  { value: 3, label: '3.0+' },
  { value: 4, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
]

interface Props {
  filters: CatalogFilters
  genres: Array<{ name: string; count: number }>
  onChange: (patch: Partial<CatalogFilters>) => void
  onReset: () => void
  activeCount: number
}

function Fieldset({
  legend,
  children,
  className,
}: {
  legend: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <fieldset className={cn('flex flex-col gap-3 border-t border-line pt-5', className)}>
      <legend className="kicker float-left w-full pb-1">{legend}</legend>
      {children}
    </fieldset>
  )
}

/** Checkbox styled as a chip — bigger hit area, clearer state than a native box. */
function Chip({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: () => void
  label: string
  hint?: string
}) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center justify-between gap-2 px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] transition-colors',
        checked ? 'bg-acid text-on-accent' : 'bg-surface-2 text-fg-muted hover:text-fg',
      )}
    >
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            'block h-2 w-2 border transition-colors',
            checked ? 'border-on-accent bg-on-accent' : 'border-line-strong',
          )}
        />
        {label}
      </span>
      {hint && <span className={checked ? 'text-on-accent/70' : 'text-fg-faint'}>{hint}</span>}
    </label>
  )
}

export function FiltersPanel({ filters, genres, onChange, onReset, activeCount }: Props) {
  const priceId = useId()

  const toggleGenre = (name: string) =>
    onChange({
      genres: filters.genres.includes(name)
        ? filters.genres.filter((g) => g !== name)
        : [...filters.genres, name],
    })

  const togglePlatform = (platform: Platform) =>
    onChange({
      platforms: filters.platforms.includes(platform)
        ? filters.platforms.filter((p) => p !== platform)
        : [...filters.platforms, platform],
    })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl uppercase">Filters</h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear ({activeCount})
          </Button>
        )}
      </div>

      <Fieldset legend="Genre" className="border-t-0 pt-0">
        <div className="flex flex-col gap-1">
          {genres.map((genre) => (
            <Chip
              key={genre.name}
              label={genre.name}
              hint={String(genre.count)}
              checked={filters.genres.includes(genre.name)}
              onChange={() => toggleGenre(genre.name)}
            />
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Platform">
        <div className="flex flex-col gap-1">
          {PLATFORMS.map((platform) => (
            <Chip
              key={platform}
              label={platform}
              checked={filters.platforms.includes(platform)}
              onChange={() => togglePlatform(platform)}
            />
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Max price">
        <label htmlFor={priceId} className="sr-only">
          Maximum price
        </label>
        <input
          id={priceId}
          type="range"
          min={5}
          max={MAX_PRICE}
          step={5}
          value={filters.maxPrice}
          onChange={(event) => onChange({ maxPrice: Number(event.target.value) })}
          className="range-acid w-full"
        />
        <div className="flex justify-between font-mono text-[0.625rem] text-fg-faint">
          <span>$5</span>
          <span className="text-fg">
            {filters.maxPrice >= MAX_PRICE ? 'Any' : `up to $${filters.maxPrice}`}
          </span>
          <span>${MAX_PRICE}</span>
        </div>
      </Fieldset>

      <Fieldset legend="Rating">
        <div className="grid grid-cols-4 gap-1">
          {RATINGS.map((rating) => (
            <button
              key={rating.value}
              type="button"
              aria-pressed={filters.minRating === rating.value}
              onClick={() => onChange({ minRating: rating.value })}
              className={cn(
                'py-2 font-mono text-[0.6875rem] transition-colors',
                filters.minRating === rating.value
                  ? 'bg-acid text-on-accent'
                  : 'bg-surface-2 text-fg-muted hover:text-fg',
              )}
            >
              {rating.label}
            </button>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Offers">
        <Chip
          label="On sale only"
          checked={filters.onSale}
          onChange={() => onChange({ onSale: !filters.onSale })}
        />
      </Fieldset>
    </div>
  )
}
