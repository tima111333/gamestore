import { NextResponse } from 'next/server'
import { parseFilters, PAGE_SIZE } from '@/lib/filters'
import { getCatalogPage } from '@/lib/games'

/**
 * Feeds the catalogue's infinite scroll. The first page is rendered on the
 * server; this only serves pages 2+, so the initial payload stays small.
 *
 * Never cached by a shared cache. An earlier `s-maxage` header let a CDN store
 * the response under a key that ignored the query string, so every page came
 * back as page 1 — the client then de-duplicated the identical ids, saw no new
 * cards, and asked again in a loop (110 requests in 15 seconds on the deployed
 * site). The upstream data is already cached in the data layer, so serving this
 * fresh costs almost nothing.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filters = parseFilters(searchParams)
  const page = Math.max(1, Math.min(Number(searchParams.get('page')) || 1, 50))

  try {
    const result = await getCatalogPage(filters, page, PAGE_SIZE)
    return NextResponse.json(result, {
      headers: { 'cache-control': 'no-store' },
    })
  } catch (error) {
    console.error('[api/games]', error)
    return NextResponse.json({ error: 'Catalogue unavailable' }, { status: 502 })
  }
}
