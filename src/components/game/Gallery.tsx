'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Screenshot viewer with a thumbnail strip and a keyboard-navigable lightbox.
 * Loaded through `next/dynamic` — it is below the fold and carries its own
 * event handling, so it should not sit in the first client bundle.
 */
export function Gallery({ shots, title }: { shots: string[]; title: string }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const step = useCallback(
    (direction: number) => setActive((current) => (current + direction + shots.length) % shots.length),
    [shots.length],
  )

  useEffect(() => {
    if (!lightbox) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false)
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, step])

  if (!shots.length) return null

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="notch group relative aspect-video overflow-hidden border border-line bg-surface-2"
        aria-label={`Open screenshot ${active + 1} of ${shots.length} full size`}
      >
        <Image
          key={shots[active]}
          src={shots[active]}
          alt={`${title} screenshot ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          quality={70}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 bg-void/80 px-2 py-1 font-mono text-[0.625rem] text-fg-muted">
          {active + 1} / {shots.length}
        </span>
      </button>

      <ul className="grid grid-cols-6 gap-2">
        {shots.map((shot, index) => (
          <li key={shot}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show screenshot ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'relative block aspect-video w-full overflow-hidden border transition-colors',
                index === active ? 'border-acid' : 'border-line hover:border-line-strong',
              )}
            >
              <Image
                src={shot}
                alt=""
                fill
                sizes="120px"
                quality={70}
                className={cn(
                  'object-cover transition-opacity',
                  index === active ? 'opacity-100' : 'opacity-60 hover:opacity-100',
                )}
              />
            </button>
          </li>
        ))}
      </ul>

      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-void/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} screenshots`}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border border-line-strong font-mono text-sm text-fg"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            autoFocus
          >
            ✕
          </button>

          <button
            type="button"
            className="absolute left-4 z-10 flex h-11 w-11 items-center justify-center border border-line-strong text-fg"
            onClick={() => step(-1)}
            aria-label="Previous screenshot"
          >
            ←
          </button>

          <div className="relative aspect-video w-full max-w-6xl">
            <Image
              src={shots[active]}
              alt={`${title} screenshot ${active + 1}`}
              fill
              sizes="100vw"
              quality={85}
              className="object-contain"
            />
          </div>

          <button
            type="button"
            className="absolute right-4 bottom-4 z-10 flex h-11 w-11 items-center justify-center border border-line-strong text-fg sm:bottom-auto"
            onClick={() => step(1)}
            aria-label="Next screenshot"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
