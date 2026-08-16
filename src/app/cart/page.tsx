import type { Metadata } from 'next'
import { Container } from '@/components/ui/Section'
import { CartView } from '@/components/cart/CartView'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Your VOLTA cart — stored locally in this browser.',
  robots: { index: false },
}

export default function CartPage() {
  return (
    <Container className="pb-24 pt-28 lg:pt-36">
      <header className="mb-10 flex flex-col gap-3">
        <span className="kicker">Cart</span>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl">Your queue</h1>
        <p className="max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
          Stored in this browser only — no account, no server. Clearing site data empties it.
        </p>
      </header>

      <CartView />
    </Container>
  )
}
