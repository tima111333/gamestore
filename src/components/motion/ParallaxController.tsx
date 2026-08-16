'use client'

import { useEffect } from 'react'
import { getLenis } from '@/components/motion/SmoothScroll'
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/**
 * Scroll-bound parallax for `[data-parallax-layer]` elements.
 *
 * GSAP + ScrollTrigger is imported inside the effect, so it is fetched only on
 * the route that mounts this controller — it never reaches the shared bundle.
 * Layers animate `yPercent` (a transform) and nothing else.
 *
 * Sits out entirely on small screens and under reduced motion.
 */
export function ParallaxController() {
  const reduced = usePrefersReducedMotion()
  const wideEnough = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    if (reduced || !wideEnough) return

    let cleanup = () => {}
    let cancelled = false

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)

      // Lenis owns the scroll loop; without this the pinned layers lag a frame.
      const lenis = getLenis()
      const onScroll = () => ScrollTrigger.update()
      lenis?.on('scroll', onScroll)

      const context = gsap.context(() => {
        const layers = document.querySelectorAll<HTMLElement>('[data-parallax-layer]')

        layers.forEach((layer) => {
          const speed = Number(layer.dataset.parallaxLayer ?? 0.15)
          const trigger = layer.closest('section') ?? layer

          gsap.fromTo(
            layer,
            { yPercent: -speed * 50 },
            {
              yPercent: speed * 50,
              ease: 'none',
              scrollTrigger: {
                trigger,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            },
          )
        })
      })

      ScrollTrigger.refresh()

      cleanup = () => {
        lenis?.off('scroll', onScroll)
        context.revert()
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [reduced, wideEnough])

  return null
}
