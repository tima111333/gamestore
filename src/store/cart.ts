'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Game } from '@/types/game'
import { finalPrice } from '@/lib/utils'

export interface CartItem {
  id: number
  slug: string
  title: string
  cover: string
  /** Unit price after discount, frozen at add-to-cart time. */
  price: number
  basePrice: number
  discount: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  /** False until persisted state is read, so SSR and first paint agree. */
  hydrated: boolean
  add: (game: Game) => void
  remove: (id: number) => void
  setQuantity: (id: number, quantity: number) => void
  clear: () => void
}

type PersistedCart = Pick<CartState, 'items'>

export const useCart = create<CartState>()(
  persist<CartState, [], [], PersistedCart>(
    (set) => ({
      items: [],
      hydrated: false,

      add: (game) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === game.id)
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === game.id
                  ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
                  : item,
              ),
            }
          }
          const item: CartItem = {
            id: game.id,
            slug: game.slug,
            title: game.title,
            cover: game.cover,
            price: finalPrice(game.price, game.discount),
            basePrice: game.price,
            discount: game.discount,
            quantity: 1,
          }
          return { items: [...state.items, item] }
        }),

      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) =>
                  item.id === id ? { ...item, quantity: Math.min(quantity, 10) } : item,
                ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'volta-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Runs after localStorage is read (empty storage included), which is the
      // signal client-only UI waits for before rendering counts and totals.
      onRehydrateStorage: () => () => {
        useCart.setState({ hydrated: true })
      },
    },
  ),
)

export const cartCount = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.quantity, 0)

export const cartSubtotal = (items: CartItem[]): number =>
  Math.round(items.reduce((total, item) => total + item.price * item.quantity, 0) * 100) / 100

export const cartSavings = (items: CartItem[]): number =>
  Math.round(
    items.reduce((total, item) => total + (item.basePrice - item.price) * item.quantity, 0) * 100,
  ) / 100
