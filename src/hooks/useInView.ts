'use client'

import { useEffect, useRef, useState } from 'react'

interface Options {
  /** Fraction of the element that must be visible. */
  threshold?: number
  /** Extra margin around the root, e.g. reveal slightly before entry. */
  rootMargin?: string
  /** Stop observing after the first intersection. */
  once?: boolean
}

/**
 * Viewport detection via IntersectionObserver — no scroll listeners, so it costs
 * nothing while idle and never runs layout on the main thread per frame.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
}: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, inView }
}
