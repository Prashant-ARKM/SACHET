import { useDashboard } from '../hooks/useDashboard.js'
import Tile from '../components/Tile.jsx'
import { BarsIcon, MapIcon } from '../components/icons.jsx'
import TypeChart from '../components/TypeChart.jsx'
import { SCAM_TYPES, scamLabel } from '../../shared/scamTypes.js'
import { countBy, sortedCounts } from '../lib/stats.js'

export default function TypesPage() {
  const { filtered, filters, toggleType, lang, t } = useDashboard()

  // Where each scam type is most reported (helps target awareness campaigns).
  const byType = SCAM_TYPES.map((item) => {
    const mine = filtered.filter((r) => r.scam_type === item.id)
    return { ...item, count: mine.length, top: sortedCounts(countBy(mine, 'district')).slice(0, 3) }
  })
    .filter((item) => item.count)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[minmax(0,1fr)]">
      <Tile title={t?.typesTileBarFilter || 'All scam types · click a bar to filter'} icon={BarsIcon} className="col-span-12 lg:col-span-6">
        <div className="h-96 lg:h-full">
          <TypeChart reports={filtered} selected={filters.type} onSelect={toggleType} lang={lang} />
        </div>
      </Tile>
      <Tile title={t?.typesWhereReported || 'Where each type is reported most'} icon={MapIcon} tint="bg-sun-tint text-warn" className="col-span-12 lg:col-span-6" bodyClass="overflow-auto pr-1">
        <ul className="divide-y divide-line">
          {byType.map((item) => (
            <li key={item.id} className="py-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{scamLabel(item.id, lang)}</span>
                <span className="text-muted">{item.count}</span>
              </div>
              <div className="text-xs text-muted mt-0.5">
                {item.top.map(([d, n]) => `${d} (${n})`).join(' · ')}
              </div>
            </li>
          ))}
          {!byType.length && <li className="py-2 text-sm text-muted">{t?.noReportsMatch || 'No reports match these filters'}</li>}
        </ul>
      </Tile>
    </div>
  )
}
