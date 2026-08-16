'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { BackgroundClip } from '@/lib/media'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface NetworkInformation {
  saveData?: boolean
  effectiveType?: string
}

/**
 * Poster-first background video.
 *
 * The poster is a real `next/image` with `priority`, so it is the LCP element
 * and paints immediately. The video itself carries no `src` until we decide the
 * device should have it — desktop, cursor present, motion allowed, no data
 * saver — and it pauses whenever it scrolls out of view.
 */
export function HeroVideo({ clip, className }: { clip: BackgroundClip; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const allowsMotion = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const isWide = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    const video = videoRef.current
    if (!video || !allowsMotion || !isWide) return

    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
    if (connection?.saveData || /2g/.test(connection?.effectiveType ?? '')) return

    let cancelled = false
    const attach = () => {
      if (cancelled || video.src) return
      video.src = clip.src
      video.load()
      video.play().then(
        () => !cancelled && setPlaying(true),
        () => {
          /* Autoplay refused — the poster stays, which is a fine hero. */
        },
      )
    }

    // Let the page finish its critical work before touching the network.
    const idle = window.requestIdleCallback?.(attach, { timeout: 2500 })
    const fallback = idle === undefined ? window.setTimeout(attach, 1200) : undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video.src) return
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.05 },
    )
    observer.observe(video)

    const onVisibility = () => {
      if (!video.src) return
      if (document.hidden) video.pause()
      else video.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      if (idle !== undefined) window.cancelIdleCallback?.(idle)
      if (fallback !== undefined) window.clearTimeout(fallback)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [clip.src, allowsMotion, isWide])

  return (
    <div className={className} aria-hidden="true">
      <Image
        src={clip.poster}
        alt=""
        fill
        priority
        quality={70}
        sizes="100vw"
        className="object-cover"
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={clip.poster}
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        style={{ opacity: playing ? 1 : 0 }}
      />
    </div>
  )
}
