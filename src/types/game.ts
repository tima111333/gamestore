/** Shape both data sources (RAWG API and the offline catalogue) are mapped to. */

export const PLATFORMS = [
  'PC',
  'PlayStation 5',
  'Xbox Series X',
  'Nintendo Switch',
  'macOS',
  'Linux',
] as const

export type Platform = (typeof PLATFORMS)[number]

export interface Requirement {
  label: string
  value: string
}

export interface Trailer {
  src: string
  poster: string
}

export interface Game {
  id: number
  slug: string
  title: string
  /** One-line hook shown on cards and in the hero. */
  tagline: string
  description: string
  /** Portrait key art, 2:3. */
  cover: string
  /** Wide key art used for detail pages and feature rails. */
  hero: string
  /** 16:9 capsule used inside catalogue cards. */
  capsule: string
  screenshots: string[]
  trailer: Trailer | null
  released: string
  developers: string[]
  publishers: string[]
  genres: string[]
  tags: string[]
  platforms: Platform[]
  /** 0–5. */
  rating: number
  ratingsCount: number
  metacritic: number | null
  /** Full price in USD before discount. */
  price: number
  /** Percentage off, 0 when not on sale. */
  discount: number
  featured: boolean
  requirements: {
    minimum: Requirement[]
    recommended: Requirement[]
  }
}

export type SortKey = 'relevance' | 'rating' | 'price-asc' | 'price-desc' | 'released' | 'name'

export interface CatalogFilters {
  search: string
  genres: string[]
  platforms: Platform[]
  maxPrice: number
  minRating: number
  sort: SortKey
  onSale: boolean
}

export interface CatalogPage {
  games: Game[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  /** True when the RAWG key is missing or the API failed and mock data was served. */
  fallback: boolean
}
