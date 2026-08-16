import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Section'
import { ParallaxController } from '@/components/motion/ParallaxController'
import { Reveal } from '@/components/motion/Reveal'
import { loadCatalogue } from '@/lib/games'
import { GENRE_RAILS, gamesInRail } from '@/lib/genres'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Genres',
  description: 'Six curated shelves — role playing, action, shooters, indie, adventure, strategy.',
}

export default async function GenresPage() {
  const { games } = await loadCatalogue()

  return (
    <div>
      {/* Loads GSAP/ScrollTrigger on this route only. */}
      <ParallaxController />

      <Container as="header" className="pb-16 pt-28 lg:pt-36">
        <span className="kicker">Genres</span>
        <h1 className="mt-3 text-5xl sm:text-6xl lg:text-8xl">Six shelves</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
          Every rail is a saved search. Open one and the catalogue arrives pre-filtered — no
          duplicate browsing model to learn.
        </p>
      </Container>

      {GENRE_RAILS.map((rail, index) => {
        const railGames = gamesInRail(games, rail)
        const backdrop = railGames[0]?.hero ?? games[0].hero

        return (
          <section
            key={rail.slug}
            data-genre-rail
            aria-labelledby={`rail-${rail.slug}`}
            className="relative isolate overflow-hidden border-t border-line py-20 lg:py-28"
          >
            {/* Parallax layers: backdrop moves slower than the copy on top of it. */}
            <div className="absolute inset-0 -z-10 opacity-[0.14]" data-parallax-layer="0.15">
              <Image
                src={backdrop}
                alt=""
                fill
                sizes="100vw"
                quality={70}
                className="scale-110 object-cover"
              />
            </div>
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-b from-void via-void/85 to-void"
              aria-hidden="true"
            />

            <Container>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl" data-parallax-layer="-0.05">
                  <span className="kicker">
                    {String(index + 1).padStart(2, '0')} — {railGames.length} titles
                  </span>
                  <h2
                    id={`rail-${rail.slug}`}
                    className={cn(
                      'mt-4 text-[clamp(2.5rem,9vw,7rem)] leading-[0.85]',
                      rail.accent === 'acid' ? 'text-acid-text' : 'text-hot-text',
                    )}
                  >
                    {rail.name}
                  </h2>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-fg-muted">
                    {rail.blurb}
                  </p>
                </div>

                <Link
                  href={`/catalog?genre=${encodeURIComponent(rail.match[0])}`}
                  className="group inline-flex shrink-0 items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:text-acid-text"
                >
                  Open in catalog
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>

              <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                {railGames.slice(0, 6).map((game, cardIndex) => (
                  <Reveal as="li" key={game.id} delay={cardIndex * 0.05}>
                    <Link href={`/game/${game.slug}`} className="group block">
                      <div className="notch-sm relative aspect-[2/3] overflow-hidden border border-line bg-surface-2 transition-colors group-hover:border-acid/60">
                        <div className="art-scrim z-10" />
                        <Image
                          src={game.cover}
                          alt={`${game.title} key art`}
                          fill
                          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 24vw, 16vw"
                          quality={70}
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-2 truncate font-mono text-[0.625rem] uppercase tracking-[0.14em] text-fg-muted">
                        {game.title}
                      </p>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </Container>
          </section>
        )
      })}
    </div>
  )
}
