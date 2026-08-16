/** Tiny class joiner — enough for our conditional class needs, zero deps. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export const formatPrice = (value: number): string => (value === 0 ? 'Free' : usd.format(value))

/** Final price after the discount, rounded to cents. */
export const finalPrice = (price: number, discount: number): number =>
  Math.round(price * (1 - discount / 100) * 100) / 100

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export const formatCount = (value: number): string => compact.format(value)

/** Steam dates arrive as "May 18, 2015"; RAWG as "2015-05-18". Normalise both. */
export function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function releaseYear(value: string): string {
  const match = value.match(/\d{4}/)
  return match ? match[0] : '—'
}

/** Deterministic 0–1 hash so server and client agree on "random" layout choices. */
export function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)
