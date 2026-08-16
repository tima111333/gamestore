import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Section'
import { getDeals } from '@/lib/games'
import { Countdown } from '@/components/deals/Countdown'
import { GameCard } from '@/components/game/GameCard'
import { AddToCartButton } from '@/components/game/AddToCartButton'
import { PriceTag } from '@/components/ui/PriceTag'
import { Rating } from '@/components/ui/Rating'

export const metadata: Metadata = {
  title: 'Deals',
  description: 'Current discounts across the VOLTA catalogue, with a live countdown.',
}

/** The sale resets at midnight UTC — computed server-side so every visitor agrees. */
function nextMidnightUTC(): string {
  const now = new Date()
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  return new Date(end).toISOString()
}

export default async function DealsPage() {
  const deals = await getDeals()
  const [headline, ...rest] = deals
  const endsAt = nextMidnightUTC()

  if (!headline) {
    return (
      <Container className="flex min-h-[60svh] flex-col justify-center py-32">
        <h1 className="text-5xl">No active deals</h1>
        <p className="mt-4 text-fg-muted">Everything is at full price right now. Check back later.</p>
      </Container>
    )
  }

  return (
    <div>
      <Container as="header" className="pb-12 pt-28 lg:pt-36">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="kicker">Deals</span>
            <h1 className="mt-3 text-5xl sm:text-6xl lg:text-8xl">
              Midnight
              <br />
              <span className="text-hot-text">markdown</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-fg-muted sm:text-base">
              {deals.length} titles are discounted until the counter hits zero. Prices reset at
              00:00 UTC.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="kicker">Sale ends in</span>
            <Countdown endsAt={endsAt} />
          </div>
        </div>
      </Container>

      <Container className="pb-16">
        <article
          data-game-card
          className="notch relative grid overflow-hidden border border-line bg-surface lg:grid-cols-2"
        >
          <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[28rem]">
            <Image
              src={headline.hero}
              alt={`${headline.title} key art`}
              fill
              priority
              quality={70}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-void/30" aria-hidden="true" />
            <div
              className="absolute inset-0 bg-gradient-to-t from-surface via-surface/45 to-transparent lg:bg-gradient-to-r"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
            <div>
              <span className="inline-block bg-hot px-3 py-1 font-mono text-xs font-bold text-on-accent">
                −{headline.discount}% · Best deal
              </span>
              <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl">
                <Link href={`/game/${headline.slug}`} className="transition-colors hover:text-acid-text">
                  {headline.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-fg-muted sm:text-base">
                {headline.tagline}
              </p>
              <Rating value={headline.rating} count={headline.ratingsCount} className="mt-6" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <PriceTag price={headline.price} discount={headline.discount} size="lg" />
              <AddToCartButton game={headline} size="lg" label="Add to cart" />
            </div>
          </div>
        </article>
      </Container>

      <Container className="pb-24">
        <h2 className="mb-8 text-3xl sm:text-4xl">Everything else on sale</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {rest.map((game, index) => (
            <li key={game.id}>
              <GameCard game={game} index={index + 1} />
            </li>
          ))}
        </ul>
      </Container>
    </div>
  )
}
