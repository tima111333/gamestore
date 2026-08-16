import Image from 'next/image'
import Link from 'next/link'
import type { Game } from '@/types/game'
import { HeroVideo } from '@/components/home/HeroVideo'
import { ParallaxLayer } from '@/components/motion/ParallaxLayer'
import { HERO_CLIP } from '@/lib/media'
import { MagneticLink } from '@/components/ui/MagneticButton'
import { SplitText } from '@/components/motion/SplitText'
import { AccentSceneLoader } from '@/components/three/AccentSceneLoader'
import { Enter } from '@/components/motion/Enter'
import { formatCount } from '@/lib/utils'

export function Hero({ spotlight, catalogueSize }: { spotlight: Game; catalogueSize: number }) {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <ParallaxLayer className="absolute inset-0 -z-10" speed={0.18}>
        {/* Scaled up so the parallax travel never exposes an edge. */}
        <HeroVideo clip={HERO_CLIP} className="absolute inset-0 scale-110" />
        {/* Legibility scrim — three stops keep the headline readable over any frame. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-void via-void/88 to-void/70"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,transparent,var(--void))]"
          aria-hidden="true"
        />
      </ParallaxLayer>

      {/* Desktop-only 3D accent, loaded on idle and unmounted off-screen. */}
      <AccentSceneLoader className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden h-full w-[46vw] opacity-70 lg:block" />

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-32 sm:px-6 lg:px-10 lg:pb-24">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <Enter as="p" delay={0.05} className="kicker mb-6">
              Curated game store · Est. 2026
            </Enter>

            <h1 className="text-[clamp(3rem,11vw,10rem)] leading-[0.85] text-fg">
              <SplitText text="Games worth" className="block" stagger={0.028} />
              <SplitText
                text="finishing"
                className="block text-acid-text text-glow"
                delay={0.2}
                stagger={0.028}
              />
            </h1>

            {/* Transform-only entrance: this paragraph is the LCP candidate, so
                it must be opaque from the first frame. */}
            <Enter
              as="p"
              variant="rise"
              delay={0.25}
              className="mt-8 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg"
            >
              {catalogueSize} hand-picked worlds — no shovelware, no infinite scroll of asset flips.
              Just the ones we would replay.
            </Enter>

            <Enter delay={0.4} className="mt-10 flex flex-wrap items-center gap-3">
              <MagneticLink href="/catalog" size="lg">
                Browse catalog
              </MagneticLink>
              <MagneticLink href="/deals" size="lg" variant="outline">
                See deals
              </MagneticLink>
            </Enter>
          </div>

          {/* Spotlight card — a second focal point and a real entry point. */}
          <Enter delay={0.5}>
            <Link
              href={`/game/${spotlight.slug}`}
              className="group glass notch relative flex w-full max-w-sm items-center gap-4 p-3 transition-colors duration-300 hover:border-acid/60 lg:w-80"
            >
              <div className="relative h-24 w-16 shrink-0 overflow-hidden bg-surface-2">
                <div className="art-scrim z-10" />
                <Image
                  src={spotlight.cover}
                  alt=""
                  fill
                  sizes="64px"
                  quality={70}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <p className="kicker mb-1">In the spotlight</p>
                <p className="truncate font-display text-xl uppercase leading-tight text-fg">
                  {spotlight.title}
                </p>
                <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-fg-faint">
                  {spotlight.rating.toFixed(1)} ★ · {formatCount(spotlight.ratingsCount)} players
                </p>
              </div>
            </Link>
          </Enter>
        </div>
      </div>

      <a
        href="#featured"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-fg-faint transition-colors hover:text-acid-text lg:flex"
      >
        Scroll
        <span className="relative block h-10 w-px bg-line-strong">
          <span className="scroll-cue absolute inset-x-0 top-0 h-4 bg-acid" />
        </span>
      </a>
    </section>
  )
}
