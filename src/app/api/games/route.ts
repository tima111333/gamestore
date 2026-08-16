import { NextResponse } from 'next/server'
import { parseFilters, PAGE_SIZE } from '@/lib/filters'
import { getCatalogPage } from '@/lib/games'

/**
 * Feeds the catalogue's infinite scroll. The first page is rendered on the
 * server; this only serves pages 2+, so the initial payload stays small.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filters = parseFilters(searchParams)
  const page = Math.max(1, Math.min(Number(searchParams.get('page')) || 1, 50))

  try {
    const result = await getCatalogPage(filters, page, PAGE_SIZE)
    return NextResponse.json(result, {
      headers: { 'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('[api/games]', error)
    return NextResponse.json({ error: 'Catalogue unavailable' }, { status: 502 })
  }
}
