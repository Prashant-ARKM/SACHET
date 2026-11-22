import { DISTRICTS } from '../../shared/districts.js'
import { countBy, districtTrend, inr, sortedCounts } from '../lib/stats.js'
import { scamLabel } from '../../shared/scamTypes.js'

// Every district: reports, money lost, top scam type, 7-day change.
export default function DistrictTable({ reports, trendReports, selected, onSelect, lang = 'en', t }) {
  const counts = countBy(reports, 'district')
  const trend = Object.fromEntries(districtTrend(trendReports).map((r) => [r.district, r]))

  const rows = DISTRICTS.map((d) => {
    const mine = reports.filter((r) => r.district === d.name)
    return {
      name: d.name,
      count: counts[d.name] ?? 0,
      lost: mine.reduce((s, r) => s + (r.amount_lost || 0), 0),
      topType: sortedCounts(countBy(mine, 'scam_type'))[0]?.[0],
      change: trend[d.name]?.change ?? 0,
    }
  }).sort((a, b) => b.count - a.count)

  return (
    <div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted sticky top-0 bg-card">
          <tr>
            <th className="py-2 pr-3 font-medium">{t?.thDistrict || 'District'}</th>
            <th className="py-2 pr-3 font-medium text-right">{t?.thReports || 'Reports'}</th>
            <th className="py-2 pr-3 font-medium text-right">{t?.th7Day || '7-day'}</th>
            <th className="py-2 pr-3 font-medium">{t?.thTopType || 'Top type'}</th>
            <th className="py-2 font-medium text-right">{t?.thLost || 'Lost'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct = Math.round(r.change * 100)
            return (
              <tr
                key={r.name}
                onClick={() => onSelect(selected === r.name ? '' : r.name)}
                className={`border-t border-line cursor-pointer hover:bg-beige ${selected === r.name ? 'bg-beige font-semibold' : ''}`}
              >
                <td className="py-2 pr-3">{r.name}</td>
                <td className="py-2 pr-3 text-right">{r.count}</td>
                <td className={`py-2 pr-3 text-right text-xs whitespace-nowrap ${pct > 0 ? 'text-scam' : pct < 0 ? 'text-safe' : 'text-muted'}`}>
                  {pct > 0 ? '▲' : pct < 0 ? '▼' : ''} {Math.abs(pct)}%
                </td>
                <td className="py-2 pr-3 text-muted">{r.topType ? scamLabel(r.topType, lang) : '–'}</td>
                <td className="py-2 text-right">{r.lost ? inr(r.lost) : '–'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
