import { Hero } from '@/components/home/Hero'
import { FeaturedRail } from '@/components/home/FeaturedRail'
import { DealsStrip } from '@/components/home/DealsStrip'
import { GenreTeaser } from '@/components/home/GenreTeaser'
import { loadCatalogue, getFeatured, getDeals } from '@/lib/games'

export default async function HomePage() {
  const [{ games }, featured, deals] = await Promise.all([
    loadCatalogue(),
    getFeatured(6),
    getDeals(),
  ])

  return (
    <>
      <Hero spotlight={featured[0]} catalogueSize={games.length} />
      <FeaturedRail games={featured} />
      <DealsStrip games={deals.slice(0, 4)} />
      <GenreTeaser games={games} />
    </>
  )
}
