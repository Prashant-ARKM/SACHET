import { countBy, sortedCounts, totals, inr } from '../lib/stats.js'
import { scamLabel } from '../data/scamTypes.js'

export default function KpiRow({ reports }) {
  const t = totals(reports)
  const topType = sortedCounts(countBy(reports, 'scam_type'))[0]
  const topDistrict = sortedCounts(countBy(reports, 'district'))[0]

  const items = [
    { label: 'Reports', value: t.count },
    { label: 'Last 24 h', value: t.last24h },
    { label: 'Money lost', value: inr(t.amountLost), sub: `${t.victimsWithLoss} reports with loss` },
    { label: 'Top scam type', value: topType ? scamLabel(topType[0]) : '–', sub: topType && `${topType[1]} reports` },
    { label: 'Top district', value: topDistrict?.[0] ?? '–', sub: topDistrict && `${topDistrict[1]} reports` },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((k) => (
        <div key={k.label} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500">{k.label}</div>
          <div className="text-xl font-bold mt-1">{k.value}</div>
          {k.sub && <div className="text-xs text-gray-500 mt-1">{k.sub}</div>}
        </div>
      ))}
    </div>
  )
}
