import { DISTRICTS } from '../../shared/districts.js'
import { SCAM_TYPES } from '../../shared/scamTypes.js'

const RANGES = [
  { days: 1, label: '24 h' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 0, label: 'All' },
]

// One compact row: title + status on the left, filters on the right.
export default function TopBar({ title, source, updatedAt, filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch })
  const sel = 'border border-line rounded-full px-3 py-1.5 text-sm bg-card text-ink'

  const badge =
    source === 'live'
      ? { text: 'Live', cls: 'bg-safe/10 text-safe' }
      : source === 'sample'
        ? { text: 'Sample data', cls: 'bg-warn/10 text-warn' }
        : { text: 'Loading…', cls: 'bg-line text-muted' }

  return (
    <header className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
          <span className="relative flex w-2 h-2">
            {source === 'live' && <span className="absolute inline-flex w-full h-full rounded-full bg-current opacity-60 animate-ping" />}
            <span className="relative inline-flex w-2 h-2 rounded-full bg-current" />
          </span>
          {badge.text}
        </span>
        {updatedAt && <span className="hidden xl:inline text-xs text-muted">Updated {updatedAt.toLocaleTimeString()}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(filters.district || filters.type) && (
          <button className="text-sm text-forest underline" onClick={() => set({ district: '', type: '' })}>
            Clear
          </button>
        )}

        <select className={sel} value={filters.district} onChange={(e) => set({ district: e.target.value })}>
          <option value="">All districts</option>
          {DISTRICTS.map((d) => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <select className={sel} value={filters.type} onChange={(e) => set({ type: e.target.value })}>
          <option value="">All scam types</option>
          {SCAM_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.en}</option>
          ))}
        </select>

        <div className="flex border border-line rounded-full overflow-hidden text-sm bg-card p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => set({ days: r.days })}
              className={`px-3 py-1 rounded-full ${filters.days === r.days ? 'bg-forest text-card' : 'text-ink hover:bg-beige'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
