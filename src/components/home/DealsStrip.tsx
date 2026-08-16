import Image from 'next/image'
import Link from 'next/link'
import type { Game } from '@/types/game'
import { Container } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { finalPrice, formatPrice } from '@/lib/utils'

/** Loud discount block — the one place the layout goes full acid. */
export function DealsStrip({ games }: { games: Game[] }) {
  const [lead, ...rest] = games
  if (!lead) return null

  return (
    <Container className="py-20 lg:py-28">
      <div className="notch relative overflow-hidden border border-line bg-surface">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative aspect-[16/10] lg:aspect-auto">
            <Image
              src={lead.hero}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              quality={70}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-void/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent lg:bg-gradient-to-r" />
            <span className="absolute bottom-4 left-4 font-display text-[clamp(4rem,12vw,9rem)] leading-none text-acid">
              −{lead.discount}%
            </span>
          </div>

          <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
            <div>
              <p className="kicker mb-4">02 — Deals</p>
              <h2 className="text-4xl sm:text-5xl">{lead.title}</h2>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-fg-muted sm:text-base">
                {lead.tagline}
              </p>
              <p className="mt-6 font-mono text-sm text-fg-muted">
                <span className="text-fg-faint line-through">{formatPrice(lead.price)}</span>{' '}
                <span className="text-2xl font-bold text-fg">
                  {formatPrice(finalPrice(lead.price, lead.discount))}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <ul className="flex flex-col divide-y divide-line border-y border-line">
                {rest.map((game) => (
                  <li key={game.id}>
                    <Link
                      href={`/game/${game.slug}`}
                      className="group flex items-center justify-between gap-4 py-3 transition-colors hover:text-acid-text"
                    >
                      <span className="truncate text-sm">{game.title}</span>
                      <span className="shrink-0 font-mono text-xs">
                        <span className="mr-2 bg-hot px-1.5 py-0.5 text-on-accent">−{game.discount}%</span>
                        {formatPrice(finalPrice(game.price, game.discount))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <ButtonLink href="/deals" size="md" className="self-start">
                All deals
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
