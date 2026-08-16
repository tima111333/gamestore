'use client'

import { useEffect, useEffectEvent, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Makes an overlay behave like a real dialog: focus moves inside on open, Tab
 * cycles within it, Escape closes it, and focus returns to whatever opened it.
 *
 * Without this a `role="dialog"` is a lie — the keyboard stays on the page
 * behind the overlay.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean, onClose: () => void) {
  const ref = useRef<T>(null)
  // Non-reactive: the effect reads the latest callback without a new inline
  // function restarting the trap on every render.
  const close = useEffectEvent(() => onClose())

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const items = () =>
      [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
      )

    items()[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = items()
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [active])

  return ref
}
