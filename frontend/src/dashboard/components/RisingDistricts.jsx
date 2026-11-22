import { districtTrend } from '../lib/stats.js'

// Last 7 days vs the 7 days before: "rising" vs "quieter" places.
export default function RisingDistricts({ reports, selected, onSelect, limit = 6, order = 'busiest' }) {
  let rows = districtTrend(reports)
  if (order === 'falling') rows = rows.filter((r) => r.prev7 >= 3).sort((a, b) => a.change - b.change)
  rows = rows.slice(0, limit)
  const max = Math.max(1, ...rows.map((r) => r.last7))

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = Math.round(r.change * 100)
        const up = pct > 0
        return (
          <li key={r.district}>
            <button
              onClick={() => onSelect(selected === r.district ? '' : r.district)}
              className={`w-full text-left text-sm ${selected === r.district ? 'font-semibold text-forest' : 'text-ink'}`}
            >
              <div className="flex justify-between gap-2">
                <span className="truncate">{r.district}</span>
                <span className="whitespace-nowrap">
                  <span className="font-semibold">{r.last7}</span>{' '}
                  <span className={`text-xs ${up ? 'text-scam' : 'text-safe'}`}>
                    {up ? '▲' : pct < 0 ? '▼' : '•'} {Math.abs(pct)}%
                  </span>
                </span>
              </div>
              <div className="h-1.5 bg-beige rounded-full mt-1.5">
                <div
                  className={`h-1.5 rounded-full ${up ? 'bg-scam' : 'bg-forest'}`}
                  style={{ width: `${(r.last7 / max) * 100}%` }}
                />
              </div>
            </button>
          </li>
        )
      })}
      {!rows.length && <li className="text-sm text-muted">No reports yet</li>}
    </ul>
  )
}
