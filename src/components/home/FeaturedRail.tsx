import Image from 'next/image'
import Link from 'next/link'
import type { Game } from '@/types/game'
import { Container, SectionHeader } from '@/components/ui/Section'
import { PriceTag } from '@/components/ui/PriceTag'
import { Rating } from '@/components/ui/Rating'
import { AddToCartButton } from '@/components/game/AddToCartButton'

/**
 * Horizontal snap rail of wide capsules. Native scrolling — no JS carousel, so
 * it works with keyboard, touch and trackpads for free.
 */
export function FeaturedRail({ games }: { games: Game[] }) {
  return (
    <Container className="scroll-mt-24 py-20 lg:py-28" >
      <div id="featured" />
      <SectionHeader
        kicker="01 — Featured"
        title="On the front page"
        description="The shelf we would push into your hands if this were a physical shop."
        href="/catalog"
      />

      <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 [scrollbar-width:thin]">
        {games.map((game, index) => (
          <li
            key={game.id}
            data-game-card
            className="group relative w-[85vw] shrink-0 snap-start sm:w-[440px]"
          >
            <div className="notch relative aspect-[16/9] overflow-hidden border border-line bg-surface-2 transition-colors duration-300 group-hover:border-acid/60">
              <Link href={`/game/${game.slug}`} className="absolute inset-0 z-20" aria-label={game.title} />
              <Image
                src={game.capsule}
                alt=""
                fill
                sizes="(max-width: 640px) 85vw, 440px"
                quality={70}
                priority={index === 0}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
              <div className="art-scrim" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
              <span className="absolute left-3 top-3 z-30 font-mono text-[0.625rem] tracking-[0.2em] text-fg-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-2xl">{game.title}</h3>
                <p className="mt-1 line-clamp-1 text-sm text-fg-muted">{game.tagline}</p>
                <Rating value={game.rating} count={game.ratingsCount} className="mt-3" />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <PriceTag price={game.price} discount={game.discount} />
                <AddToCartButton game={game} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  )
}
