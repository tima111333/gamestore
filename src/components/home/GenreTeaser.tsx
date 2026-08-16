import Link from 'next/link'
import type { Game } from '@/types/game'
import { Container, SectionHeader } from '@/components/ui/Section'
import { Reveal } from '@/components/motion/Reveal'
import { GENRE_RAILS, gamesInRail } from '@/lib/genres'
import { cn } from '@/lib/utils'

/** Typographic genre index — no art, just scale, count and an accent hairline. */
export function GenreTeaser({ games }: { games: Game[] }) {
  return (
    <Container className="py-20 lg:py-28">
      <SectionHeader
        kicker="03 — Genres"
        title="Pick your poison"
        description="Six shelves, one taxonomy. Every rail links straight into a filtered catalogue."
        href="/genres"
        cta="Explore genres"
      />

      <ul className="mt-10 border-t border-line">
        {GENRE_RAILS.map((rail, index) => {
          const count = gamesInRail(games, rail).length
          return (
            <Reveal as="li" key={rail.slug} delay={index * 0.06} className="border-b border-line">
              <Link
                href={`/catalog?genre=${encodeURIComponent(rail.match[0])}`}
                className="group flex items-baseline justify-between gap-6 py-6 transition-colors sm:py-8"
              >
                <span className="flex items-baseline gap-4 sm:gap-8">
                  <span className="font-mono text-[0.625rem] text-fg-faint">{rail.slug}</span>
                  <span
                    className={cn(
                      'font-display text-3xl uppercase leading-none transition-colors sm:text-5xl lg:text-6xl',
                      rail.accent === 'acid'
                        ? 'group-hover:text-acid-text'
                        : 'group-hover:text-hot-text',
                    )}
                  >
                    {rail.name}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-fg-faint">
                  {String(count).padStart(2, '0')}
                  <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          )
        })}
      </ul>
    </Container>
  )
}
