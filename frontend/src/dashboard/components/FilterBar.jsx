import { DISTRICTS } from '../data/districts.js'
import { SCAM_TYPES } from '../data/scamTypes.js'

const RANGES = [
  { days: 1, label: '24 h' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 0, label: 'All' },
]

export default function FilterBar({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch })
  const sel = 'border border-gray-300 rounded px-2 py-1 text-sm bg-white'

  return (
    <div className="flex flex-wrap items-center gap-2">
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

      <div className="flex border border-gray-300 rounded overflow-hidden text-sm">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => set({ days: r.days })}
            className={`px-3 py-1 ${filters.days === r.days ? 'bg-gray-900 text-white' : 'bg-white'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {(filters.district || filters.type) && (
        <button className="text-sm underline" onClick={() => set({ district: '', type: '' })}>
          Clear
        </button>
      )}
    </div>
  )
}
