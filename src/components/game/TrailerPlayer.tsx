'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { Trailer } from '@/types/game'

/**
 * Click-to-play trailer. Nothing is fetched until the user asks for it
 * (`preload="none"`, no `src`), and it pauses itself when scrolled away.
 */
export function TrailerPlayer({ trailer, title }: { trailer: Trailer; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !started) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) video.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(video)

    const onVisibility = () => {
      if (document.hidden) video.pause()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [started])

  const start = () => {
    const video = videoRef.current
    if (!video) return
    if (!video.src) video.src = trailer.src
    setStarted(true)
    void video.play()
  }

  return (
    <figure className="notch relative aspect-video overflow-hidden border border-line bg-surface-2">
      <video
        ref={videoRef}
        controls={started}
        preload="none"
        playsInline
        poster={trailer.poster}
        className="h-full w-full object-cover"
        aria-label={`${title} trailer`}
      />

      {!started && (
        <>
          <Image
            src={trailer.poster}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            quality={70}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-void/40" aria-hidden="true" />
          <button
            type="button"
            onClick={start}
            className="group absolute inset-0 flex items-center justify-center"
          >
            <span className="flex items-center gap-3 bg-acid px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-on-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
                <path d="M0 0l10 6-10 6z" />
              </svg>
              Play trailer
            </span>
            <span className="sr-only">Play the {title} trailer</span>
          </button>
        </>
      )}
    </figure>
  )
}
