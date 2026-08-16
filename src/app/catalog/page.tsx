import type { Metadata } from 'next'
import { Container } from '@/components/ui/Section'
import { CatalogView } from '@/components/catalog/CatalogView'
import { parseFilters } from '@/lib/filters'
import { getCatalogPage, loadCatalogue } from '@/lib/games'
import { genreFacets } from '@/lib/genres'

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Filter the VOLTA catalogue by genre, platform, price and rating.',
}

type SearchParams = Record<string, string | string[] | undefined>

/** searchParams arrive as a promise in Next 16 and drive the whole view. */
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const readable = {
    get: (key: string) => {
      const value = params[key]
      return Array.isArray(value) ? (value[0] ?? null) : (value ?? null)
    },
  }

  const filters = parseFilters(readable)
  const [initial, { games }] = await Promise.all([getCatalogPage(filters, 1), loadCatalogue()])

  return (
    <Container className="pb-24 pt-28 lg:pt-36">
      <header className="mb-10 flex flex-col gap-3">
        <span className="kicker">Catalog</span>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl">Everything we stock</h1>
        <p className="max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
          Eighteen titles, no filler. Filters live in the URL — copy the address and the exact view
          travels with it.
        </p>
      </header>

      <CatalogView initial={initial} filters={filters} genres={genreFacets(games)} />
    </Container>
  )
}
