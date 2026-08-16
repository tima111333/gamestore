'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Game } from '@/types/game'
import { PriceTag } from '@/components/ui/PriceTag'
import { Rating } from '@/components/ui/Rating'
import { AddToCartButton } from '@/components/game/AddToCartButton'
import { TiltCard } from '@/components/game/TiltCard'
import { HoverTrailer } from '@/components/game/HoverTrailer'
import { cn, releaseYear } from '@/lib/utils'

/** Grid sizes so the browser never downloads more pixels than the slot needs. */
const CARD_SIZES = '(max-width: 640px) 46vw, (max-width: 1024px) 30vw, (max-width: 1536px) 23vw, 340px'

export function GameCard({
  game,
  priority = false,
  index,
  className,
}: {
  game: Game
  priority?: boolean
  index?: number
  className?: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      data-game-card
      className={cn('group relative flex flex-col gap-3', className)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <TiltCard>
        <div className="notch relative aspect-[2/3] overflow-hidden border border-line bg-surface-2 transition-colors duration-300 group-hover:border-acid/60">
          <Image
            src={game.cover}
            alt={`${game.title} key art`}
            fill
            sizes={CARD_SIZES}
            quality={70}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />

          <HoverTrailer
            trailer={game.trailer}
            active={hovered}
            className="absolute inset-0 z-10 h-full w-full object-cover"
          />

          <div className="art-scrim z-20" />
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-void via-void/30 to-transparent" />

          <Link
            href={`/game/${game.slug}`}
            className="absolute inset-0 z-30"
            tabIndex={-1}
            aria-hidden="true"
          />

          {game.discount > 0 && (
            <span className="absolute left-0 top-0 z-40 bg-hot px-2 py-1 font-mono text-[0.6875rem] font-bold text-on-accent">
              −{game.discount}%
            </span>
          )}

          {typeof index === 'number' && (
            <span className="absolute right-2 top-2 z-40 font-mono text-[0.625rem] text-fg-faint">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between gap-2 p-3">
            <Rating value={game.rating} showCount={false} />
            <span className="font-mono text-[0.625rem] text-fg-faint">
              {releaseYear(game.released)}
            </span>
          </div>
        </div>
      </TiltCard>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-lg leading-tight">
          <Link
            href={`/game/${game.slug}`}
            className="relative z-30 transition-colors hover:text-acid-text"
          >
            {game.title}
          </Link>
        </h3>

        <p className="line-clamp-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-fg-faint">
          {game.genres.slice(0, 2).join(' · ')}
        </p>

        {/* Two cards fit in 360px, which leaves ~160px per card — price and
            button only share a line once there is room for both. */}
        <div className="mt-auto flex flex-col items-start gap-2 pt-1 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <PriceTag price={game.price} discount={game.discount} size="sm" />
          <AddToCartButton game={game} className="relative z-30" />
        </div>
      </div>
    </article>
  )
}
