/**
 * One-off content tool: builds `src/lib/mock-data.ts` from the public Steam
 * store API (no key required). Run it only when the fallback catalogue needs
 * refreshing — the generated file is committed and the app never calls Steam
 * at runtime.
 *
 *   node scripts/generate-mock.mjs
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lib', 'mock-data.ts')

/** Hand-curated: Steam only knows about PC, so consoles and tags live here. */
const CATALOGUE = [
  { appid: 292030, slug: 'the-witcher-3-wild-hunt', consoles: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], tags: ['Open World', 'Story Rich', 'Fantasy'], featured: true, discount: 70 },
  { appid: 1091500, slug: 'cyberpunk-2077', consoles: ['PlayStation 5', 'Xbox Series X'], tags: ['Cyberpunk', 'Open World', 'Shooter'], featured: true, discount: 50 },
  { appid: 1245620, slug: 'elden-ring', consoles: ['PlayStation 5', 'Xbox Series X'], tags: ['Souls-like', 'Difficult', 'Open World'], featured: true, discount: 30 },
  { appid: 1174180, slug: 'red-dead-redemption-2', consoles: ['PlayStation 5', 'Xbox Series X'], tags: ['Western', 'Open World', 'Story Rich'], discount: 67 },
  { appid: 1086940, slug: 'baldurs-gate-3', consoles: ['PlayStation 5', 'Xbox Series X'], tags: ['CRPG', 'Turn-Based', 'Co-op'], featured: true, discount: 0 },
  { appid: 1145360, slug: 'hades', consoles: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], tags: ['Roguelike', 'Action', 'Mythology'], discount: 55 },
  { appid: 367520, slug: 'hollow-knight', consoles: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], tags: ['Metroidvania', 'Difficult', 'Atmospheric'], discount: 40 },
  { appid: 413150, slug: 'stardew-valley', consoles: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], tags: ['Farming Sim', 'Pixel Graphics', 'Relaxing'], discount: 0 },
  { appid: 620, slug: 'portal-2', consoles: ['PlayStation 5', 'Xbox Series X'], tags: ['Puzzle', 'Co-op', 'Comedy'], discount: 80 },
  { appid: 814380, slug: 'sekiro-shadows-die-twice', consoles: ['PlayStation 5', 'Xbox Series X'], tags: ['Souls-like', 'Ninja', 'Difficult'], discount: 45 },
  { appid: 782330, slug: 'doom-eternal', consoles: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], tags: ['FPS', 'Gore', 'Fast-Paced'], featured: true, discount: 75 },
  { appid: 1593500, slug: 'god-of-war', consoles: ['PlayStation 5'], tags: ['Action', 'Mythology', 'Story Rich'], discount: 35 },
  { appid: 632470, slug: 'disco-elysium', consoles: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], tags: ['Detective', 'Dialogue', 'Isometric'], discount: 60 },
  { appid: 870780, slug: 'control', consoles: ['PlayStation 5', 'Xbox Series X'], tags: ['Supernatural', 'Third Person', 'Atmospheric'], discount: 65 },
  { appid: 504230, slug: 'celeste', consoles: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], tags: ['Platformer', 'Pixel Graphics', 'Difficult'], discount: 0 },
  { appid: 268910, slug: 'cuphead', consoles: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], tags: ['Run and Gun', 'Hand-drawn', 'Difficult'], discount: 30 },
  { appid: 1332010, slug: 'stray', consoles: ['PlayStation 5', 'Xbox Series X'], tags: ['Cats', 'Adventure', 'Cyberpunk'], discount: 50 },
  { appid: 275850, slug: 'no-mans-sky', consoles: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], tags: ['Space', 'Survival', 'Exploration'], discount: 60 },
]

const stripHtml = (html = '') =>
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
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()

/** Requirement blocks come back as "Key: value" lines; keep the useful ones. */
const parseRequirements = (html) => {
  const lines = stripHtml(html)
    .split('\n')
    .map((l) => l.replace(/^•\s*/, '').trim())
    .filter(Boolean)
    .filter((l) => !/^(minimum|recommended):?$/i.test(l))
  const out = []
  for (const line of lines) {
    const [rawKey, ...rest] = line.split(':')
    if (!rest.length) continue
    const key = rawKey.trim().replace(/\s*\*+$/, '')
    const value = rest.join(':').trim()
    if (!value || value.length > 180) continue
    if (/^(additional notes|storage|sound card|network)/i.test(key) && out.length > 5) continue
    out.push({ label: key, value })
  }
  return out.slice(0, 7)
}

const clean = (url = '') => url.split('?')[0].replace('http://', 'https://')

/** Cut on a sentence, then on a word — never mid-word. */
const truncate = (text, max) => {
  if (text.length <= max) return text
  const window = text.slice(0, max)
  const sentence = window.lastIndexOf('. ')
  if (sentence > max * 0.5) return window.slice(0, sentence + 1)
  return `${window.slice(0, window.lastIndexOf(' '))}…`
}

/**
 * `about_the_game` is mostly marketing markup and images; once stripped it can
 * come back near-empty, so fall back to the short description.
 */
const describe = (data) => {
  const long = stripHtml(data.about_the_game || data.detailed_description || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 40)
    .join(' ')
  const short = stripHtml(data.short_description || '')
  return truncate(long.length > 200 ? long : short || long, 900)
}

const fetchApp = async (appid) => {
  const res = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english&cc=us`,
    { headers: { 'accept-language': 'en' } },
  )
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${appid}`)
  const json = await res.json()
  const entry = json[String(appid)]
  if (!entry?.success) throw new Error(`no data for ${appid}`)
  return entry.data
}

const build = (data, meta) => {
  const movie = data.movies?.[0]
  const platforms = [
    ...(data.platforms?.windows ? ['PC'] : []),
    ...meta.consoles,
    ...(data.platforms?.mac ? ['macOS'] : []),
    ...(data.platforms?.linux ? ['Linux'] : []),
  ]
  const basePrice = data.price_overview
    ? data.price_overview.initial / 100
    : data.is_free
      ? 0
      : 29.99
  const rating = data.metacritic?.score ? Math.round((data.metacritic.score / 20) * 10) / 10 : 4.2

  return {
    id: data.steam_appid,
    slug: meta.slug,
    title: data.name,
    tagline: truncate(stripHtml(data.short_description), 150),
    description: describe(data),
    cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${meta.appid}/library_600x900.jpg`,
    hero: `https://cdn.cloudflare.steamstatic.com/steam/apps/${meta.appid}/library_hero.jpg`,
    capsule: `https://cdn.cloudflare.steamstatic.com/steam/apps/${meta.appid}/capsule_616x353.jpg`,
    screenshots: (data.screenshots ?? []).slice(0, 6).map((s) => clean(s.path_full)),
    trailer: movie
      ? {
          src: `https://video.akamai.steamstatic.com/store_trailers/${movie.id}/movie480.mp4`,
          poster: clean(movie.thumbnail),
        }
      : null,
    released: data.release_date?.date ?? 'TBA',
    developers: data.developers ?? [],
    publishers: data.publishers ?? [],
    genres: (data.genres ?? []).map((g) => g.description),
    tags: meta.tags,
    platforms,
    rating,
    ratingsCount: 1200 + ((data.steam_appid * 7919) % 48000),
    metacritic: data.metacritic?.score ?? null,
    price: Number(basePrice.toFixed(2)),
    discount: meta.discount ?? 0,
    featured: Boolean(meta.featured),
    requirements: {
      minimum: parseRequirements(data.pc_requirements?.minimum ?? ''),
      recommended: parseRequirements(data.pc_requirements?.recommended ?? ''),
    },
  }
}

const games = []
for (const meta of CATALOGUE) {
  try {
    const data = await fetchApp(meta.appid)
    games.push(build(data, meta))
    console.log(`ok   ${meta.slug}`)
  } catch (error) {
    console.warn(`skip ${meta.slug}: ${error.message}`)
  }
  await new Promise((r) => setTimeout(r, 350))
}

const banner = `// AUTO-GENERATED by scripts/generate-mock.mjs — do not edit by hand.
// Source: public Steam store API. Media is served from Steam's CDN.
// This is the offline fallback catalogue: the site renders fully without a RAWG key.
import type { Game } from '@/types/game'

export const MOCK_GAMES: Game[] = `

await writeFile(OUT, banner + JSON.stringify(games, null, 2) + '\n', 'utf8')
console.log(`\nwrote ${games.length} games -> ${OUT}`)
