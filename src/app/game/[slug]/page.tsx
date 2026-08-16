import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSlugs, getGame, getSimilar } from '@/lib/games'
import { Container } from '@/components/ui/Section'
import { Rating, Metascore } from '@/components/ui/Rating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Tag } from '@/components/ui/Tag'
import { AddToCartButton } from '@/components/game/AddToCartButton'
import { GalleryLoader } from '@/components/game/GalleryLoader'
import { TrailerPlayer } from '@/components/game/TrailerPlayer'
import { SystemRequirements } from '@/components/game/SystemRequirements'
import { GameCard } from '@/components/game/GameCard'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const game = await getGame(slug)
  if (!game) return { title: 'Not found' }

  return {
    title: game.title,
    description: game.tagline,
    openGraph: {
      title: game.title,
      description: game.tagline,
      images: [{ url: game.hero, width: 1920, height: 620, alt: `${game.title} key art` }],
    },
  }
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params
  const game = await getGame(slug)
  if (!game) notFound()

  const similar = await getSimilar(game, 4)

  const facts = [
    { label: 'Released', value: formatDate(game.released) },
    { label: 'Developer', value: game.developers.join(', ') || '—' },
    { label: 'Publisher', value: game.publishers.join(', ') || '—' },
    { label: 'Platforms', value: game.platforms.join(', ') },
  ]

  return (
    <article>
      <header className="relative min-h-[60svh] overflow-hidden pt-28 lg:min-h-[70svh]">
        <Image
          src={game.hero}
          alt=""
          fill
          priority
          quality={70}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-void/35" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/88 to-void/55" aria-hidden="true" />

        <Container className="relative flex min-h-[inherit] flex-col justify-end pb-10">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-faint">
              <li>
                <Link href="/catalog" className="transition-colors hover:text-acid-text">
                  Catalog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-fg-muted">{game.genres[0] ?? 'Game'}</li>
            </ol>
          </nav>

          <h1 className="max-w-4xl text-[clamp(2.5rem,7vw,6rem)] leading-[0.9]">{game.title}</h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {game.tagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Rating value={game.rating} count={game.ratingsCount} />
            {game.metacritic && <Metascore score={game.metacritic} />}
            <ul className="flex flex-wrap gap-2">
              {game.genres.map((genre) => (
                <li key={genre}>
                  <Link href={`/catalog?genre=${encodeURIComponent(genre)}`}>
                    <Tag tone="outline">{genre}</Tag>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div className="flex flex-col gap-16">
          {game.trailer && (
            <section aria-labelledby="trailer" className="flex flex-col gap-6">
              <h2 id="trailer" className="text-3xl sm:text-4xl">
                Trailer
              </h2>
              <TrailerPlayer trailer={game.trailer} title={game.title} />
            </section>
          )}

          <section aria-labelledby="about" className="flex flex-col gap-6">
            <h2 id="about" className="text-3xl sm:text-4xl">
              About
            </h2>
            <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-fg-muted">
              {game.description}
            </p>
            <ul className="flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <li key={tag}>
                  <Tag>{tag}</Tag>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="shots" className="flex flex-col gap-6">
            <h2 id="shots" className="text-3xl sm:text-4xl">
              Screenshots
            </h2>
            <GalleryLoader shots={game.screenshots} title={game.title} />
          </section>

          <SystemRequirements
            minimum={game.requirements.minimum}
            recommended={game.requirements.recommended}
          />
        </div>

        {/* Buy box: sticky on desktop, inline on mobile. */}
        <aside className="lg:sticky lg:top-28 lg:h-fit" data-game-card>
          <div className="glass notch flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="relative h-32 w-22 shrink-0 overflow-hidden border border-line">
                <Image
                  src={game.cover}
                  alt={`${game.title} cover`}
                  width={88}
                  height={132}
                  quality={70}
                  className="h-full w-full object-cover"
                />
              </div>
              <PriceTag price={game.price} discount={game.discount} size="lg" className="text-right" />
            </div>

            <AddToCartButton game={game} size="lg" label="Add to cart" className="w-full" />

            <dl className="flex flex-col divide-y divide-line border-t border-line">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-1 py-3">
                  <dt className="kicker">{fact.label}</dt>
                  <dd className="text-sm text-fg">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </Container>

      {similar.length > 0 && (
        <Container className="pb-24">
          <h2 className="mb-8 text-3xl sm:text-4xl">More like this</h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {similar.map((item) => (
              <li key={item.id}>
                <GameCard game={item} />
              </li>
            ))}
          </ul>
        </Container>
      )}
    </article>
  )
}
