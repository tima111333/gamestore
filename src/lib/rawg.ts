/**
 * RAWG API client.
 *
 * Server-only: the key never reaches the browser. Every call is time-boxed and
 * failure-tolerant — a miss returns `null` and the caller falls back to the
 * offline catalogue, so the site behaves identically with or without a key.
 */
import type { Game, Platform, Requirement } from '@/types/game'
import { PLATFORMS } from '@/types/game'
import { isAllowedImage, safeImage } from '@/lib/image-hosts'
import { seededUnit } from '@/lib/utils'

/** Shown when a record has no usable art at all. */
const FALLBACK_ART = '/art-missing.svg'

const BASE = 'https://api.rawg.io/api'
const TIMEOUT_MS = 7000
/** Catalogue is refreshed hourly; a game page holds for a day. */
const LIST_TTL = 3600
const DETAIL_TTL = 86400

export const hasRawgKey = (): boolean => Boolean(process.env.RAWG_API_KEY?.trim())

/**
 * Circuit breaker. Once RAWG has failed, stop paying the timeout on every
 * subsequent render for a minute — a dead upstream should cost one slow
 * request, not one per page.
 */
const BREAKER_MS = 60_000
let breakerOpenUntil = 0

interface RawgGenre {
  name: string
}
interface RawgTag {
  name: string
  language?: string
}
interface RawgPlatformSlot {
  platform: { name: string; slug: string }
  requirements_en?: { minimum?: string; recommended?: string } | null
}
interface RawgShortScreenshot {
  image: string
}
interface RawgStudio {
  name: string
}

interface RawgGame {
  id: number
  slug: string
  name: string
  description_raw?: string
  background_image: string | null
  background_image_additional?: string | null
  rating: number
  ratings_count: number
  metacritic: number | null
  released: string | null
  genres?: RawgGenre[]
  tags?: RawgTag[]
  platforms?: RawgPlatformSlot[]
  parent_platforms?: Array<{ platform: { name: string; slug: string } }>
  short_screenshots?: RawgShortScreenshot[]
  developers?: RawgStudio[]
  publishers?: RawgStudio[]
}

interface RawgList<T> {
  count: number
  results: T[]
}

interface RawgMovie {
  id: number
  name: string
  preview: string
  data: Record<string, string>
}

async function rawgFetch<T>(path: string, params: Record<string, string>, ttl: number): Promise<T | null> {
  const key = process.env.RAWG_API_KEY?.trim()
  if (!key || Date.now() < breakerOpenUntil) return null

  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('key', key)
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value)

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: ttl, tags: ['rawg'] },
      headers: { accept: 'application/json' },
    })
    if (!response.ok) {
      console.warn(`[rawg] ${path} -> HTTP ${response.status}`)
      // 4xx means the key is wrong; 5xx means RAWG is unwell. Both: back off.
      breakerOpenUntil = Date.now() + BREAKER_MS
      return null
    }
    breakerOpenUntil = 0
    return (await response.json()) as T
  } catch (error) {
    // Timeouts, DNS failures, rate limits: all handled the same way — fall back.
    console.warn(`[rawg] ${path} failed:`, (error as Error).message)
    breakerOpenUntil = Date.now() + BREAKER_MS
    return null
  }
}

const PLATFORM_ALIASES: Array<[RegExp, Platform]> = [
  [/^pc$|windows/i, 'PC'],
  [/playstation 5|^ps5$/i, 'PlayStation 5'],
  [/xbox series/i, 'Xbox Series X'],
  [/nintendo switch/i, 'Nintendo Switch'],
  [/macos|^mac$|apple/i, 'macOS'],
  [/linux/i, 'Linux'],
]

function mapPlatforms(game: RawgGame): Platform[] {
  const names = [
    ...(game.platforms ?? []).map((slot) => slot.platform.name),
    ...(game.parent_platforms ?? []).map((slot) => slot.platform.name),
  ]

  const matched = new Set<Platform>()
  for (const name of names) {
    const hit = PLATFORM_ALIASES.find(([pattern]) => pattern.test(name))
    if (hit) matched.add(hit[1])
  }
  // Keep the canonical order rather than discovery order.
  return PLATFORMS.filter((platform) => matched.has(platform))
}

/** RAWG requirement blobs look like "Minimum:OS: Windows 10Processor: i5…". */
function parseRequirements(raw?: string | null): Requirement[] {
  if (!raw) return []
  const KEYS = [
    'OS',
    'Processor',
    'Memory',
    'Graphics',
    'DirectX',
    'Storage',
    'Sound Card',
    'Network',
    'Additional Notes',
  ]
  const cleaned = raw.replace(/^\s*(minimum|recommended)\s*:?/i, '').trim()
  const pattern = new RegExp(`(${KEYS.join('|')})\\s*:\\s*`, 'gi')

  const rows: Requirement[] = []
  const matches = [...cleaned.matchAll(pattern)]
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index : cleaned.length
    const value = cleaned.slice(start, end).trim().replace(/\s+/g, ' ')
    if (value && value.length < 180) rows.push({ label: match[1], value })
  })
  return rows.slice(0, 7)
}

/**
 * RAWG has no commerce data, so price and discount are derived from the id.
 * Deterministic on purpose: the server and the client must agree, and a title
 * must not change price between renders.
 */
function derivePricing(game: RawgGame): { price: number; discount: number } {
  const tiers = [9.99, 14.99, 19.99, 24.99, 29.99, 39.99, 49.99, 59.99]
  const quality = game.metacritic ?? Math.round(game.rating * 20)
  const age = game.released ? new Date().getUTCFullYear() - new Date(game.released).getUTCFullYear() : 8

  let index = quality >= 90 ? 7 : quality >= 80 ? 6 : quality >= 70 ? 5 : 3
  index = Math.max(0, index - Math.min(Math.floor(age / 3), 4))
  const price = tiers[Math.min(index, tiers.length - 1)]

  const roll = seededUnit(game.id)
  const discount = roll > 0.55 ? Math.round((0.15 + (roll - 0.55) * 1.4) * 100 / 5) * 5 : 0

  return { price, discount: Math.min(discount, 80) }
}

function toGame(game: RawgGame, extras: { trailerSrc?: string; trailerPoster?: string } = {}): Game {
  // RAWG occasionally hands back art on a host we have not whitelisted; an
  // unknown host would make `next/image` throw, so it never leaves this file.
  const art = safeImage(game.background_image, FALLBACK_ART)
  const wide = safeImage(game.background_image_additional, art)
  const screenshots = (game.short_screenshots ?? [])
    .map((shot) => shot.image)
    .filter(isAllowedImage)
    .slice(0, 6)

  const pcSlot = (game.platforms ?? []).find((slot) => /pc/i.test(slot.platform.slug))
  const { price, discount } = derivePricing(game)

  return {
    id: game.id,
    slug: game.slug,
    title: game.name,
    tagline: (game.description_raw ?? '').split('\n').find((line) => line.trim().length > 40)?.slice(0, 150) ?? game.name,
    description: (game.description_raw ?? '').slice(0, 900),
    cover: art,
    hero: wide,
    capsule: art,
    screenshots,
    trailer: extras.trailerSrc
      ? { src: extras.trailerSrc, poster: extras.trailerPoster ?? art }
      : null,
    released: game.released ?? 'TBA',
    developers: (game.developers ?? []).map((studio) => studio.name),
    publishers: (game.publishers ?? []).map((studio) => studio.name),
    genres: (game.genres ?? []).map((genre) => genre.name),
    tags: (game.tags ?? [])
      .filter((tag) => !tag.language || tag.language === 'eng')
      .slice(0, 3)
      .map((tag) => tag.name),
    platforms: mapPlatforms(game),
    rating: Math.round(game.rating * 10) / 10,
    ratingsCount: game.ratings_count,
    metacritic: game.metacritic,
    price,
    discount,
    featured: (game.metacritic ?? 0) >= 88,
    requirements: {
      minimum: parseRequirements(pcSlot?.requirements_en?.minimum),
      recommended: parseRequirements(pcSlot?.requirements_en?.recommended),
    },
  }
}

/** Top slice of the RAWG catalogue, mapped to our shape. */
export async function fetchRawgCatalogue(size = 40): Promise<Game[] | null> {
  const data = await rawgFetch<RawgList<RawgGame>>(
    '/games',
    {
      page_size: String(size),
      ordering: '-added',
      metacritic: '70,100',
      exclude_additions: 'true',
    },
    LIST_TTL,
  )
  if (!data?.results?.length) return null

  return data.results.filter((game) => Boolean(game.background_image)).map((game) => toGame(game))
}

/** Full detail for one title, including a playable trailer when RAWG has one. */
export async function fetchRawgGame(slug: string): Promise<Game | null> {
  const detail = await rawgFetch<RawgGame>(`/games/${encodeURIComponent(slug)}`, {}, DETAIL_TTL)
  if (!detail) return null

  const [movies, shots] = await Promise.all([
    rawgFetch<RawgList<RawgMovie>>(`/games/${encodeURIComponent(slug)}/movies`, {}, DETAIL_TTL),
    rawgFetch<RawgList<{ image: string }>>(
      `/games/${encodeURIComponent(slug)}/screenshots`,
      { page_size: '6' },
      DETAIL_TTL,
    ),
  ])

  const movie = movies?.results?.[0]
  const game = toGame(
    {
      ...detail,
      short_screenshots: shots?.results?.map((shot) => ({ image: shot.image })) ?? detail.short_screenshots,
    },
    {
      trailerSrc: movie?.data?.['480'] ?? movie?.data?.max,
      trailerPoster: movie?.preview,
    },
  )

  return game
}
