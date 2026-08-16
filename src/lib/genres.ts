import type { Game } from '@/types/game'

/**
 * Curated genre rails for /genres. Source genres are coarse ("Action", "RPG"),
 * so each rail also matches on tags to stay populated whichever data source is live.
 */
export interface GenreRail {
  slug: string
  name: string
  blurb: string
  /** Which accent the section paints itself with. */
  accent: 'acid' | 'hot'
  match: string[]
}

export const GENRE_RAILS: GenreRail[] = [
  {
    slug: 'rpg',
    name: 'Role Playing',
    blurb: 'Hundred-hour worlds, dialogue trees with teeth, builds you argue about online.',
    accent: 'acid',
    match: ['RPG', 'CRPG', 'Story Rich', 'Fantasy', 'Turn-Based'],
  },
  {
    slug: 'action',
    name: 'Action',
    blurb: 'Frame-perfect windows, cancel timings, bosses that teach you their language.',
    accent: 'hot',
    match: ['Action', 'Souls-like', 'Fast-Paced', 'Third Person', 'Ninja'],
  },
  {
    slug: 'shooter',
    name: 'Shooters',
    blurb: 'Recoil you can feel through the desk. Ammo counters as a rhythm section.',
    accent: 'acid',
    match: ['FPS', 'Shooter', 'Gore', 'Run and Gun'],
  },
  {
    slug: 'indie',
    name: 'Indie',
    blurb: 'Small teams, loud ideas. The part of the catalogue that keeps surprising us.',
    accent: 'hot',
    match: ['Indie', 'Pixel Graphics', 'Hand-drawn', 'Platformer', 'Metroidvania'],
  },
  {
    slug: 'adventure',
    name: 'Adventure',
    blurb: 'Places worth getting lost in, and a reason to keep walking toward the horizon.',
    accent: 'acid',
    match: ['Adventure', 'Open World', 'Exploration', 'Atmospheric', 'Cats', 'Western'],
  },
  {
    slug: 'strategy',
    name: 'Strategy & Sim',
    blurb: 'One more turn, one more harvest, one more supply line you swear you will fix.',
    accent: 'hot',
    match: ['Strategy', 'Simulation', 'Farming Sim', 'Survival', 'Relaxing', 'Puzzle'],
  },
]

const norm = (value: string) => value.toLowerCase()

export function gamesInRail(games: Game[], rail: GenreRail): Game[] {
  const wanted = new Set(rail.match.map(norm))
  return games.filter((game) =>
    [...game.genres, ...game.tags].some((label) => wanted.has(norm(label))),
  )
}

export function railBySlug(slug: string): GenreRail | undefined {
  return GENRE_RAILS.find((rail) => rail.slug === slug)
}

/** Genre facets for the catalogue filter panel, derived from the live dataset. */
export function genreFacets(games: Game[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>()
  for (const game of games) {
    for (const genre of game.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
