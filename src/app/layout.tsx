import type { Metadata, Viewport } from 'next'
import { Anton, Chakra_Petch, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { MotionProvider } from '@/components/motion/MotionProvider'

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
})

const chakra = Chakra_Petch({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-chakra',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://volta.games'),
  title: {
    default: 'VOLTA — Game Store',
    template: '%s — VOLTA',
  },
  description:
    'A curated storefront for people who finish games. Deals, deep dives and a catalogue with taste.',
  openGraph: {
    title: 'VOLTA — Game Store',
    description: 'A curated storefront for people who finish games.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080a' },
    { media: '(prefers-color-scheme: light)', color: '#f2f2ee' },
  ],
  colorScheme: 'dark light',
}

/**
 * Applied before first paint so the stored theme never flashes. Dark is the
 * house default — light only when the visitor picked it. Kept as a raw string:
 * it must run synchronously, ahead of hydration.
 */
const themeScript = `(function(){try{if(localStorage.getItem('volta-theme')==='light'){document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${anton.variable} ${chakra.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-acid focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-on-accent"
        >
          Skip to content
        </a>
        <MotionProvider>
          <ScrollProgress />
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </MotionProvider>
        <div className="texture-overlay" aria-hidden="true" />
      </body>
    </html>
  )
}
