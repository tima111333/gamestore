import Link from 'next/link'
import { Wordmark } from '@/components/layout/Wordmark'

const COLUMNS = [
  {
    title: 'Store',
    links: [
      { href: '/catalog', label: 'All games' },
      { href: '/genres', label: 'Genres' },
      { href: '/deals', label: 'Deals' },
      { href: '/cart', label: 'Cart' },
    ],
  },
  {
    title: 'Data',
    links: [
      { href: 'https://rawg.io/apidocs', label: 'RAWG API' },
      { href: 'https://www.pexels.com/', label: 'Pexels footage' },
      { href: 'https://store.steampowered.com/', label: 'Steam artwork' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line bg-surface/40">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 py-16 sm:px-6 md:grid-cols-[2fr_1fr_1fr] lg:px-10">
        <div className="flex flex-col gap-4">
          <Wordmark />
          <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
            A demo storefront built with Next.js. Catalogue data and artwork belong to their
            respective publishers; this project is a front-end showcase, nothing is for sale.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="flex flex-col gap-4">
            <h2 className="kicker">{column.title}</h2>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    // `py-1` lifts the hit area to 28px — a bare 20px line box
                    // is under the 24px minimum target size.
                    className="inline-block py-1 text-sm text-fg-muted transition-colors hover:text-acid-text"
                    {...(link.href.startsWith('http')
                      ? { target: '_blank', rel: 'noreferrer noopener' }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-6 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <span>© {new Date().getFullYear()} VOLTA — demo project</span>
          <span>Built with Next.js · Framer Motion · GSAP</span>
        </div>
      </div>
    </footer>
  )
}
