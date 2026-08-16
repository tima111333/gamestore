'use client'

import { useEffect, useRef } from 'react'
import type { Trailer } from '@/types/game'
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/** Deliberate hover, not a brush past the card. */
const INTENT_DELAY = 400

/**
 * Plays a muted trailer inside a card after the pointer rests on it.
 *
 * Nothing is requested until the intent delay elapses; leaving early cancels
 * the timer, and leaving after cancels playback and releases the buffer. Touch
 * devices and reduced-motion users never load the video at all.
 *
 * Visibility is written straight to the element rather than held in state — a
 * fade has no bearing on the React tree.
 */
export function HoverTrailer({
  trailer,
  active,
  className,
}: {
  trailer: Trailer | null
  active: boolean
  className?: string
}) {
  const finePointer = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = finePointer && !reduced && Boolean(trailer)

  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const video = videoRef.current
    if (!video) return

    const cancel = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    if (active) {
      timerRef.current = window.setTimeout(() => {
        if (!video.src) video.src = trailer!.src
        video.currentTime = 0
        void video.play().then(
          () => {
            video.style.opacity = '1'
          },
          () => {
            /* Blocked or unsupported: the cover art stays. */
          },
        )
      }, INTENT_DELAY)
    } else {
      cancel()
      video.style.opacity = '0'
      video.pause()
      // Drop the buffer so idle cards hold no video in memory.
      if (video.src) {
        video.removeAttribute('src')
        video.load()
      }
    }

    return cancel
  }, [active, enabled, trailer])

  useEffect(() => {
    const video = videoRef.current
    return () => {
      if (!video) return
      video.pause()
      video.removeAttribute('src')
    }
  }, [])

  if (!enabled) return null

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      tabIndex={-1}
      aria-hidden="true"
      className={className}
      style={{ opacity: 0, transition: 'opacity 400ms ease-out' }}
    />
  )
}
