import { useDashboard } from '../hooks/useDashboard.js'
import Tile from '../components/Tile.jsx'
import { BarsIcon, MapIcon } from '../components/icons.jsx'
import TypeChart from '../components/TypeChart.jsx'
import { SCAM_TYPES } from '../../shared/scamTypes.js'
import { countBy, sortedCounts } from '../lib/stats.js'

export default function TypesPage() {
  const { filtered, filters, toggleType } = useDashboard()

  // Where each scam type is most reported (helps target awareness campaigns).
  const byType = SCAM_TYPES.map((t) => {
    const mine = filtered.filter((r) => r.scam_type === t.id)
    return { ...t, count: mine.length, top: sortedCounts(countBy(mine, 'district')).slice(0, 3) }
  })
    .filter((t) => t.count)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[minmax(0,1fr)]">
      <Tile title="All scam types · click a bar to filter" icon={BarsIcon} className="col-span-12 lg:col-span-6">
        <div className="h-96 lg:h-full">
          <TypeChart reports={filtered} selected={filters.type} onSelect={toggleType} />
        </div>
      </Tile>
      <Tile title="Where each type is reported most" icon={MapIcon} tint="bg-sun-tint text-warn" className="col-span-12 lg:col-span-6" bodyClass="overflow-auto pr-1">
        <ul className="divide-y divide-line">
          {byType.map((t) => (
            <li key={t.id} className="py-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{t.en}</span>
                <span className="text-muted">{t.count}</span>
              </div>
              <div className="text-xs text-muted mt-0.5">
                {t.top.map(([d, n]) => `${d} (${n})`).join(' · ')}
              </div>
            </li>
          ))}
          {!byType.length && <li className="py-2 text-sm text-muted">No reports match these filters</li>}
        </ul>
      </Tile>
    </div>
  )
}
