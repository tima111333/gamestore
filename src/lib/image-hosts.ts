/**
 * Single source of truth for remote image hosts.
 *
 * `next.config.ts` turns this into `images.remotePatterns`, and the data
 * mappers check incoming URLs against it. That matters because the upstream
 * APIs are free to move artwork onto a new CDN host at any time: an unknown
 * host would otherwise make `next/image` throw mid-render and take the page
 * down. Anything unrecognised is swapped for a known-good fallback instead.
 */
export interface ImageHost {
  hostname: string
  /** Glob in `remotePatterns` form; matched by prefix at runtime. */
  pathname: string
}

export const IMAGE_HOSTS: ImageHost[] = [
  // Steam artwork.
  { hostname: 'cdn.cloudflare.steamstatic.com', pathname: '/steam/apps/**' },
  { hostname: 'cdn.akamai.steamstatic.com', pathname: '/steam/apps/**' },
  { hostname: 'shared.cloudflare.steamstatic.com', pathname: '/store_item_assets/**' },
  { hostname: 'shared.akamai.steamstatic.com', pathname: '/store_item_assets/**' },
  { hostname: 'store.cloudflare.steamstatic.com', pathname: '/images/**' },
  { hostname: 'store.akamai.steamstatic.com', pathname: '/images/**' },
  // RAWG artwork.
  { hostname: 'media.rawg.io', pathname: '/media/**' },
  // Poster frames for the Pexels background footage.
  { hostname: 'images.pexels.com', pathname: '/videos/**' },
]

export function isAllowedImage(url: string | null | undefined): boolean {
  if (!url) return false
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  if (parsed.protocol !== 'https:') return false

  return IMAGE_HOSTS.some((host) => {
    if (host.hostname !== parsed.hostname) return false
    const prefix = host.pathname.replace(/\*+$/, '')
    return parsed.pathname.startsWith(prefix)
  })
}

/** Returns the URL when it is safe to hand to `next/image`, else the fallback. */
export function safeImage(url: string | null | undefined, fallback: string): string {
  return isAllowedImage(url) ? (url as string) : fallback
}
