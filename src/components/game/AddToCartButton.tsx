'use client'

import { useRef, useState } from 'react'
import type { Game } from '@/types/game'
import { useCart } from '@/store/cart'
import { useUI } from '@/store/ui'
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button'

/**
 * Adds the game and hands the card's on-screen rectangle to the flight layer,
 * which animates a copy of the art into the cart badge.
 */
export function AddToCartButton({
  game,
  size = 'sm',
  variant = 'primary',
  label = 'Add',
  className,
}: {
  game: Game
  size?: ButtonSize
  variant?: ButtonVariant
  label?: string
  className?: string
}) {
  const add = useCart((state) => state.add)
  const launchFlight = useUI((state) => state.launchFlight)
  const [justAdded, setJustAdded] = useState(false)
  const timer = useRef<number | null>(null)
  const ref = useRef<HTMLButtonElement>(null)

  const onClick = () => {
    add(game)

    // Measure both ends once, here — the flight layer then only animates.
    const card = ref.current?.closest('[data-game-card]') ?? ref.current
    const rect = card?.getBoundingClientRect()
    const target = document.getElementById('cart-target')?.getBoundingClientRect()
    if (rect) {
      launchFlight({
        image: game.cover,
        from: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
        to: target
          ? { x: target.left + target.width / 2, y: target.top + target.height / 2 }
          : { x: window.innerWidth - 60, y: 40 },
      })
    }

    setJustAdded(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      aria-label={`Add ${game.title} to cart`}
    >
      {justAdded ? 'Added ✓' : label}
    </Button>
  )
}
