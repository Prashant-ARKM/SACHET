import { risingType, countBy, sortedCounts } from '../lib/stats.js'
import { scamLabel } from '../../shared/scamTypes.js'
import { AlertIcon } from './icons.jsx'

// Soft red tile: the scam type spreading fastest this week.
export default function AlertTile({ reports, onSelect, className = '' }) {
  const top = risingType(reports)
  const recent = top
    ? reports.filter((r) => r.scam_type === top.name && Date.now() - new Date(r.created_at) < 7 * 864e5)
    : []
  const where = sortedCounts(countBy(recent, 'district')).slice(0, 3)
  const pct = top ? Math.round(top.change * 100) : 0

  return (
    <section className={`relative overflow-hidden rounded-3xl bg-blush border border-scam/15 p-5 flex flex-col justify-between min-h-0 ${className}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-scam/10" />

      <div className="relative">
        <div className="flex items-center gap-2 text-scam">
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-scam opacity-60 animate-ping" />
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-scam" />
          </span>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">Spreading fast</span>
        </div>
        {top ? (
          <>
            <h2 className="font-display text-3xl font-bold text-scam leading-tight mt-2">{scamLabel(top.name)}</h2>
            <p className="text-sm text-ink mt-1">
              <span className="font-semibold">+{pct}%</span> this week · {top.last7} reports
            </p>
          </>
        ) : (
          <h2 className="font-display text-2xl font-bold text-scam mt-2">No fast-spreading scam</h2>
        )}
      </div>

      {top && (
        <div className="relative flex items-end justify-between gap-2 mt-3">
          <div className="text-xs text-muted">
            {where.map(([d]) => d).join(' · ')}
          </div>
          <button
            onClick={() => onSelect(top.name)}
            className="grid place-items-center w-9 h-9 rounded-full bg-scam text-card shrink-0 hover:brightness-110"
            aria-label={`Filter by ${scamLabel(top.name)}`}
            title="Filter dashboard by this scam"
          >
            <AlertIcon size={16} />
          </button>
        </div>
      )}
    </section>
  )
}
