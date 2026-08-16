'use client'

import { create } from 'zustand'

export type Theme = 'dark' | 'light'

/** A card image travelling from the grid to the cart badge. */
export interface CartFlight {
  id: string
  image: string
  from: { x: number; y: number; width: number; height: number }
  /** Viewport coordinates of the cart badge, measured at launch time. */
  to: { x: number; y: number }
}

interface UIState {
  theme: Theme
  themeReady: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  flights: CartFlight[]
  launchFlight: (flight: Omit<CartFlight, 'id'>) => void
  endFlight: (id: string) => void
  /** Bumped on every add-to-cart so the badge can react without prop drilling. */
  cartPulse: number
}

const STORAGE_KEY = 'volta-theme'

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('light', theme === 'light')
  document.documentElement.style.colorScheme = theme
}

export const useUI = create<UIState>((set) => ({
  theme: 'dark',
  themeReady: false,

  setTheme: (theme) => {
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Private mode / storage disabled: the theme still applies for this session.
    }
    set({ theme, themeReady: true })
  },

  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore
      }
      return { theme: next, themeReady: true }
    }),

  flights: [],
  launchFlight: (flight) =>
    set((state) => ({
      flights: [...state.flights, { ...flight, id: `${Date.now()}-${state.cartPulse}` }],
      cartPulse: state.cartPulse + 1,
    })),
  endFlight: (id) => set((state) => ({ flights: state.flights.filter((f) => f.id !== id) })),
  cartPulse: 0,
}))

/** Reads the class the blocking head script already set — no second flash. */
export function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

export const THEME_STORAGE_KEY = STORAGE_KEY
