import type { Requirement } from '@/types/game'

function Column({ label, rows }: { label: string; rows: Requirement[] }) {
  if (!rows.length) return null

  return (
    <div className="flex flex-col gap-4">
      <h3 className="kicker">{label}</h3>
      <dl className="flex flex-col divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[7rem_1fr] gap-4 py-3">
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-fg-faint">
              {row.label}
            </dt>
            <dd className="text-sm text-fg-muted">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function SystemRequirements({
  minimum,
  recommended,
}: {
  minimum: Requirement[]
  recommended: Requirement[]
}) {
  if (!minimum.length && !recommended.length) return null

  return (
    <section aria-labelledby="sysreq" className="flex flex-col gap-6">
      <h2 id="sysreq" className="text-3xl sm:text-4xl">
        System requirements
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <Column label="Minimum" rows={minimum} />
        <Column label="Recommended" rows={recommended} />
      </div>
    </section>
  )
}
