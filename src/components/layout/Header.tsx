'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Wordmark } from '@/components/layout/Wordmark'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { CartBadge } from '@/components/layout/CartBadge'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/catalog', label: 'Catalog' },
  { href: '/genres', label: 'Genres' },
  { href: '/deals', label: 'Deals' },
]

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Single passive listener, coalesced into a frame — never blocks scrolling.
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        frame = 0
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Escape closes the mobile menu, matching the filters drawer.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled ? 'glass border-b' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-4 sm:px-6 lg:h-20 lg:px-10">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'relative px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-colors',
                isActive(item.href) ? 'text-fg' : 'text-fg-muted hover:text-fg',
              )}
            >
              {item.label}
              <span
                className={cn(
                  'absolute inset-x-4 bottom-1 h-px origin-left bg-acid transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  isActive(item.href) ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <CartBadge />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="relative block h-3 w-5">
              <span
                className={cn(
                  'absolute left-0 h-px w-full bg-fg transition-transform duration-300',
                  menuOpen ? 'top-1.5 rotate-45' : 'top-0',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-1.5 h-px w-full bg-fg transition-opacity duration-200',
                  menuOpen ? 'opacity-0' : 'opacity-100',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 h-px w-full bg-fg transition-transform duration-300',
                  menuOpen ? 'top-1.5 -rotate-45' : 'top-3',
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="glass border-t md:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col px-4 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-line py-4 font-display text-3xl uppercase text-fg last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
