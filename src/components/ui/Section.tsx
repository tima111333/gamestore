import Link from 'next/link'
import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'

/** Shared section chrome: index kicker, display heading, hairline, optional CTA. */
export function SectionHeader({
  kicker,
  title,
  description,
  href,
  cta = 'View all',
  className,
}: {
  kicker: string
  title: ReactNode
  description?: string
  href?: string
  cta?: string
  className?: string
}) {
  return (
    <Reveal className={cn('flex flex-col gap-6', className)}>
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <span className="kicker">{kicker}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
          {description && (
            <p className="max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
              {description}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="group hidden shrink-0 items-center gap-2 py-2 font-mono text-xs uppercase tracking-[0.2em] text-fg-muted transition-colors hover:text-acid-text sm:flex"
          >
            {cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        )}
      </div>
      <div className="rule" />
    </Reveal>
  )
}

export function Container({
  children,
  className,
  as: Tag = 'section',
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'header' | 'article'
}) {
  return (
    <Tag className={cn('mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10', className)}>
      {children}
    </Tag>
  )
}
