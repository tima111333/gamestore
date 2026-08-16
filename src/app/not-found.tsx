import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80svh] w-full max-w-3xl flex-col items-start justify-center gap-6 px-4 py-32 sm:px-6">
      <span className="kicker">404</span>
      <h1 className="text-[clamp(3.5rem,14vw,10rem)] leading-[0.82] text-fg">
        No such
        <br />
        <span className="text-acid-text">shelf</span>
      </h1>
      <p className="max-w-lg text-base leading-relaxed text-fg-muted">
        That page is not in the catalogue. It may have been renamed, or the link was never real to
        begin with.
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/catalog" size="lg">
          Browse catalog
        </ButtonLink>
        <ButtonLink href="/" size="lg" variant="outline">
          Back to store
        </ButtonLink>
      </div>
    </section>
  )
}
