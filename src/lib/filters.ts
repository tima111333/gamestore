import type { CatalogFilters, Game, Platform, SortKey } from '@/types/game'
import { PLATFORMS } from '@/types/game'
import { finalPrice } from '@/lib/utils'

export const PAGE_SIZE = 8
export const MAX_PRICE = 70

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'released', label: 'Newest' },
  { value: 'name', label: 'A – Z' },
]

export const DEFAULT_FILTERS: CatalogFilters = {
  search: '',
  genres: [],
  platforms: [],
  maxPrice: MAX_PRICE,
  minRating: 0,
  sort: 'relevance',
  onSale: false,
}

/** Anything that can be read like URLSearchParams — works for both server and client. */
export interface ReadableParams {
  get(key: string): string | null
}

const list = (raw: string | null): string[] =>
  raw
    ? raw
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    : []

const isPlatform = (value: string): value is Platform =>
  (PLATFORMS as readonly string[]).includes(value)

const isSort = (value: string): value is SortKey =>
  SORT_OPTIONS.some((option) => option.value === value)

export function parseFilters(params: ReadableParams): CatalogFilters {
  const price = Number(params.get('price'))
  const rating = Number(params.get('rating'))
  const sort = params.get('sort') ?? ''

  return {
    search: (params.get('q') ?? '').slice(0, 80),
    genres: list(params.get('genre')),
    platforms: list(params.get('platform')).filter(isPlatform),
    maxPrice: Number.isFinite(price) && price > 0 ? Math.min(price, MAX_PRICE) : MAX_PRICE,
    minRating: Number.isFinite(rating) ? Math.min(Math.max(rating, 0), 5) : 0,
    sort: isSort(sort) ? sort : 'relevance',
    onSale: params.get('sale') === '1',
  }
}

/** Only non-default values reach the URL, so shared links stay readable. */
export function serializeFilters(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set('q', filters.search)
  if (filters.genres.length) params.set('genre', filters.genres.join(','))
  if (filters.platforms.length) params.set('platform', filters.platforms.join(','))
  if (filters.maxPrice < MAX_PRICE) params.set('price', String(filters.maxPrice))
  if (filters.minRating > 0) params.set('rating', String(filters.minRating))
  if (filters.sort !== 'relevance') params.set('sort', filters.sort)
  if (filters.onSale) params.set('sale', '1')
  return params
}

export function countActiveFilters(filters: CatalogFilters): number {
  return (
    (filters.search ? 1 : 0) +
    filters.genres.length +
    filters.platforms.length +
    (filters.maxPrice < MAX_PRICE ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.onSale ? 1 : 0)
  )
}

const matchesSearch = (game: Game, query: string): boolean => {
  if (!query) return true
  const haystack = [game.title, game.tagline, ...game.genres, ...game.tags, ...game.developers]
    .join(' ')
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token))
}

const byReleaseDesc = (a: Game, b: Game) =>
  new Date(b.released).getTime() - new Date(a.released).getTime()

export function applyFilters(games: Game[], filters: CatalogFilters): Game[] {
  const filtered = games.filter((game) => {
    if (!matchesSearch(game, filters.search)) return false
    if (filters.genres.length && !filters.genres.some((g) => game.genres.includes(g))) return false
    if (filters.platforms.length && !filters.platforms.some((p) => game.platforms.includes(p)))
      return false
    if (finalPrice(game.price, game.discount) > filters.maxPrice) return false
    if (game.rating < filters.minRating) return false
    if (filters.onSale && game.discount === 0) return false
    return true
  })

  const sorted = [...filtered]
  switch (filters.sort) {
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating || b.ratingsCount - a.ratingsCount)
      break
    case 'price-asc':
      sorted.sort((a, b) => finalPrice(a.price, a.discount) - finalPrice(b.price, b.discount))
      break
    case 'price-desc':
      sorted.sort((a, b) => finalPrice(b.price, b.discount) - finalPrice(a.price, a.discount))
      break
    case 'released':
      sorted.sort(byReleaseDesc)
      break
    case 'name':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
    default:
      // Relevance: featured first, then rating — stable and meaningful when idle.
      sorted.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
      )
  }
  return sorted
}
