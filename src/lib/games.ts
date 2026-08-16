/**
 * Server-side data access. Every page reads the catalogue through this module,
 * so the choice between the live RAWG API and the offline catalogue is made in
 * exactly one place.
 */
import { cache } from 'react'
import type { CatalogFilters, CatalogPage, Game } from '@/types/game'
import { MOCK_GAMES } from '@/lib/mock-data'
import { applyFilters, PAGE_SIZE } from '@/lib/filters'
import { fetchRawgCatalogue, fetchRawgGame, hasRawgKey } from '@/lib/rawg'
import { fetchSteamCatalogue } from '@/lib/steam'
import { finalPrice } from '@/lib/utils'

export type Source = 'rawg' | 'steam' | 'offline'

interface Catalogue {
  games: Game[]
  source: Source
  /** True when the offline catalogue was served instead of a live API. */
  fallback: boolean
}

/** `auto` (default) walks the chain; the rest pin one provider for testing. */
const configuredSource = (): 'auto' | Source => {
  const value = process.env.VOLTA_DATA_SOURCE?.trim().toLowerCase()
  return value === 'rawg' || value === 'steam' || value === 'offline' ? value : 'auto'
}

/**
 * Provider chain: RAWG when a key is present, then Steam (live, no key needed,
 * real prices and discounts), then the bundled offline catalogue. Callers get
 * the same shape from all three and never have to branch.
 *
 * `cache()` dedupes this across a single render: a page that asks for featured,
 * deals and the full list pays for one upstream fetch, not three.
 */
export const loadCatalogue = cache(async (): Promise<Catalogue> => {
  const pinned = configuredSource()
  const offline: Catalogue = { games: MOCK_GAMES, source: 'offline', fallback: true }
  if (pinned === 'offline') return offline

  if (pinned !== 'steam' && hasRawgKey()) {
    const rawg = await fetchRawgCatalogue()
    if (rawg && rawg.length >= 8) return { games: rawg, source: 'rawg', fallback: false }
  }

  if (pinned !== 'rawg') {
    const steam = await fetchSteamCatalogue()
    if (steam && steam.length >= 8) return { games: steam, source: 'steam', fallback: false }
  }

  return offline
})

export async function getCatalogPage(
  filters: CatalogFilters,
  page = 1,
  pageSize = PAGE_SIZE,
): Promise<CatalogPage> {
  const { games, fallback } = await loadCatalogue()
  const matched = applyFilters(games, filters)
  const start = (page - 1) * pageSize
  const slice = matched.slice(start, start + pageSize)

  return {
    games: slice,
    total: matched.length,
    page,
    pageSize,
    hasMore: start + slice.length < matched.length,
    fallback,
  }
}

export async function getGame(slug: string): Promise<Game | null> {
  const { games, source } = await loadCatalogue()
  const listed = games.find((game) => game.slug === slug)

  // RAWG's list endpoint carries no description, requirements or trailer, so a
  // detail call is needed. Steam entries are already complete. Either way, a
  // failed lookup falls back rather than failing the page.
  if (source === 'rawg') {
    const detailed = await fetchRawgGame(slug)
    if (detailed) return detailed
  }

  return listed ?? MOCK_GAMES.find((game) => game.slug === slug) ?? null
}

/** Nearest neighbours by shared genres/tags, then by rating. */
export async function getSimilar(game: Game, limit = 4): Promise<Game[]> {
  const { games } = await loadCatalogue()
  const labels = new Set([...game.genres, ...game.tags].map((label) => label.toLowerCase()))

  return games
    .filter((candidate) => candidate.id !== game.id)
    .map((candidate) => {
      const overlap = [...candidate.genres, ...candidate.tags].filter((label) =>
        labels.has(label.toLowerCase()),
      ).length
      return { candidate, overlap }
    })
    .sort((a, b) => b.overlap - a.overlap || b.candidate.rating - a.candidate.rating)
    .slice(0, limit)
    .map((entry) => entry.candidate)
}

export async function getFeatured(limit = 6): Promise<Game[]> {
  const { games } = await loadCatalogue()
  const featured = games.filter((game) => game.featured)
  const rest = games.filter((game) => !game.featured).sort((a, b) => b.rating - a.rating)
  return [...featured, ...rest].slice(0, limit)
}

export async function getDeals(): Promise<Game[]> {
  const { games } = await loadCatalogue()
  return games
    .filter((game) => game.discount > 0)
    .sort(
      (a, b) =>
        b.discount - a.discount ||
        finalPrice(a.price, a.discount) - finalPrice(b.price, b.discount),
    )
}

export async function getAllSlugs(): Promise<string[]> {
  const { games } = await loadCatalogue()
  return games.map((game) => game.slug)
}
