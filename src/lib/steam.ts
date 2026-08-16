/**
 * Steam store provider — live catalogue data with no API key.
 *
 * Uses three public (undocumented) store endpoints: `featuredcategories` for the
 * shelf, `appdetails` per title, and the CDN for artwork. Real prices and real
 * discounts, which is the reason it outranks the offline catalogue.
 *
 * Server-only. Every call is time-boxed, cached by the fetch layer, and guarded
 * by a breaker so a Steam outage costs one slow request, not one per page.
 */
import type { Game, Platform, Requirement } from '@/types/game'
import { isAllowedImage, safeImage } from '@/lib/image-hosts'
import { seededUnit } from '@/lib/utils'

const STORE = 'https://store.steampowered.com/api'
const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps'
const TRAILERS = 'https://video.akamai.steamstatic.com/store_trailers'

const TIMEOUT_MS = 8000
const SHELF_TTL = 3600 // featured shelf: hourly
const APP_TTL = 21600 // per-title detail: 6 hours
const BREAKER_MS = 60_000
/** Steam tolerates ~200 requests / 5 min per IP; we spend ~40 per revalidation. */
const CONCURRENCY = 6

let breakerOpenUntil = 0

interface ShelfItem {
  id: number
  name: string
  discount_percent?: number
}

interface Shelf {
  specials?: { items?: ShelfItem[] }
  top_sellers?: { items?: ShelfItem[] }
  new_releases?: { items?: ShelfItem[] }
}

interface AppDetails {
  type: string
  name: string
  steam_appid: number
  is_free: boolean
  short_description: string
  about_the_game?: string
  detailed_description?: string
  header_image: string
  capsule_imagev5?: string
  background_raw?: string
  pc_requirements?: { minimum?: string; recommended?: string } | []
  developers?: string[]
  publishers?: string[]
  price_overview?: { initial: number; final: number; discount_percent: number }
  platforms?: { windows?: boolean; mac?: boolean; linux?: boolean }
  metacritic?: { score: number }
  categories?: Array<{ description: string }>
  genres?: Array<{ description: string }>
  screenshots?: Array<{ path_full: string }>
  movies?: Array<{ id: number; thumbnail: string; mp4?: Record<string, string> }>
  recommendations?: { total: number }
  release_date?: { date: string }
}

async function getJson<T>(url: string, ttl: number): Promise<T | null> {
  if (Date.now() < breakerOpenUntil) return null

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: ttl, tags: ['steam'] },
      headers: { accept: 'application/json' },
    })
    if (!response.ok) {
      breakerOpenUntil = Date.now() + BREAKER_MS
      console.warn(`[steam] ${new URL(url).pathname} -> HTTP ${response.status}`)
      return null
    }
    breakerOpenUntil = 0
    return (await response.json()) as T
  } catch (error) {
    breakerOpenUntil = Date.now() + BREAKER_MS
    console.warn(`[steam] request failed:`, (error as Error).message)
    return null
  }
}

/** Runs tasks with a fixed worker count so we never burst past the rate limit. */
async function pool<T, R>(items: T[], size: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  let cursor = 0

  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await task(items[index])
    }
  })

  await Promise.all(workers)
  return results
}

const stripHtml = (html = ''): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(li|p|div|h\d)>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{2,}/g, '\n')
    .trim()

/** Cut on a sentence, then on a word — never mid-word. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const window = text.slice(0, max)
  const sentence = window.lastIndexOf('. ')
  if (sentence > max * 0.5) return window.slice(0, sentence + 1)
  return `${window.slice(0, window.lastIndexOf(' '))}…`
}

function describe(app: AppDetails): string {
  const long = stripHtml(app.about_the_game || app.detailed_description || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 40)
    .join(' ')
  const short = stripHtml(app.short_description || '')
  return truncate(long.length > 200 ? long : short || long, 900)
}

const REQUIREMENT_KEYS = /^(OS|Processor|Memory|Graphics|DirectX|Storage|Sound Card|Network)/i

function parseRequirements(html?: string): Requirement[] {
  if (!html) return []
  return stripHtml(html)
    .split('\n')
    .map((line) => line.replace(/^•\s*/, '').trim())
    .filter((line) => REQUIREMENT_KEYS.test(line) && line.includes(':'))
    .map((line) => {
      const [label, ...rest] = line.split(':')
      return { label: label.trim().replace(/\s*\*+$/, ''), value: rest.join(':').trim() }
    })
    .filter((row) => row.value && row.value.length < 180)
    .slice(0, 7)
}

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'game'

const stripQuery = (url = ''): string => url.split('?')[0].replace('http://', 'https://')

/**
 * Half of Steam's catalogue has no portrait key art, so check before using it.
 * HEAD requests bypass the framework's data cache, and whether an asset exists
 * does not change — so the answer is memoised for the life of the process.
 */
const portraitCache = new Map<number, boolean>()

async function hasPortrait(appid: number): Promise<boolean> {
  const cached = portraitCache.get(appid)
  if (cached !== undefined) return cached

  try {
    const response = await fetch(`${CDN}/${appid}/library_600x900.jpg`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      cache: 'force-cache',
    })
    portraitCache.set(appid, response.ok)
    return response.ok
  } catch {
    // A failed probe should not be remembered as "definitely missing".
    return false
  }
}

const TAG_BLOCKLIST = /steam|remote play|family sharing|cloud|stats|leaderboard|workshop|vr support/i

function toGame(app: AppDetails, portrait: boolean): Game {
  const appid = app.steam_appid
  const platforms: Platform[] = [
    ...(app.platforms?.windows ? (['PC'] as const) : []),
    ...(app.platforms?.mac ? (['macOS'] as const) : []),
    ...(app.platforms?.linux ? (['Linux'] as const) : []),
  ]

  const price = app.is_free ? 0 : (app.price_overview?.initial ?? 0) / 100
  const discount = app.price_overview?.discount_percent ?? 0

  const rating = app.metacritic
    ? Math.round((app.metacritic.score / 20) * 10) / 10
    : Math.round((3.7 + seededUnit(appid) * 0.9) * 10) / 10

  const movie = app.movies?.[0]
  // The documented mp4 fields come back empty on newer records; the legacy
  // trailer path still serves H.264, and the player degrades to its poster.
  const trailerSrc = movie?.mp4?.['480'] ?? (movie ? `${TRAILERS}/${movie.id}/movie480.mp4` : undefined)

  const requirements = Array.isArray(app.pc_requirements) ? undefined : app.pc_requirements

  // `header_image` is the only wide asset the API guarantees — the derivable
  // CDN paths (capsule_616x353 among them) 404 for a good share of the
  // catalogue, so they are never used as a source or as a fallback.
  const header = safeImage(stripQuery(app.header_image), `${CDN}/${appid}/header.jpg`)

  return {
    id: appid,
    slug: slugify(app.name),
    title: app.name,
    tagline: truncate(stripHtml(app.short_description ?? ''), 150),
    description: describe(app),
    cover: portrait ? `${CDN}/${appid}/library_600x900.jpg` : header,
    hero: safeImage(stripQuery(app.background_raw), header),
    capsule: header,
    screenshots: (app.screenshots ?? [])
      .map((shot) => stripQuery(shot.path_full))
      .filter(isAllowedImage)
      .slice(0, 6),
    trailer: trailerSrc
      ? { src: trailerSrc, poster: safeImage(stripQuery(movie!.thumbnail), header) }
      : null,
    released: app.release_date?.date ?? 'TBA',
    developers: app.developers ?? [],
    publishers: app.publishers ?? [],
    genres: (app.genres ?? []).map((genre) => genre.description),
    tags: (app.categories ?? [])
      .map((category) => category.description)
      .filter((label) => !TAG_BLOCKLIST.test(label))
      .slice(0, 3),
    platforms,
    rating,
    ratingsCount: app.recommendations?.total ?? Math.round(800 + seededUnit(appid + 7) * 40000),
    metacritic: app.metacritic?.score ?? null,
    price: Number(price.toFixed(2)),
    discount,
    featured: (app.metacritic?.score ?? 0) >= 85 || discount >= 50,
    requirements: {
      minimum: parseRequirements(requirements?.minimum),
      recommended: parseRequirements(requirements?.recommended),
    },
  }
}

async function fetchApp(appid: number): Promise<Game | null> {
  const payload = await getJson<Record<string, { success: boolean; data?: AppDetails }>>(
    `${STORE}/appdetails?appids=${appid}&cc=us&l=english`,
    APP_TTL,
  )
  const entry = payload?.[String(appid)]
  if (!entry?.success || !entry.data) return null

  const app = entry.data
  // Skip DLC, soundtracks, demos and anything without art to show.
  if (app.type !== 'game' || !app.header_image || !app.screenshots?.length) return null

  return toGame(app, await hasPortrait(appid))
}

/**
 * The live shelf: current specials first (they carry real discounts), then top
 * sellers and new releases, de-duplicated.
 */
export async function fetchSteamCatalogue(limit = 36): Promise<Game[] | null> {
  const shelf = await getJson<Shelf>(`${STORE}/featuredcategories?cc=us&l=english`, SHELF_TTL)
  if (!shelf) return null

  const ids = [
    ...(shelf.specials?.items ?? []),
    ...(shelf.top_sellers?.items ?? []),
    ...(shelf.new_releases?.items ?? []),
  ]
    .map((item) => item.id)
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, limit)

  if (!ids.length) return null

  const games = (await pool(ids, CONCURRENCY, fetchApp)).filter(
    (game): game is Game => game !== null,
  )

  // Slugs come from titles, so collisions are possible — keep them unique.
  const seen = new Set<string>()
  for (const game of games) {
    if (seen.has(game.slug)) game.slug = `${game.slug}-${game.id}`
    seen.add(game.slug)
  }

  return games.length ? games : null
}
