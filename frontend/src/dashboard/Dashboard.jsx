import { useMemo, useState } from 'react'
import { useReports } from './hooks/useReports.js'
import { filterReports } from './lib/stats.js'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import KpiRow from './components/KpiRow.jsx'
import Panel from './components/Panel.jsx'
import DistrictMap from './components/DistrictMap.jsx'
import RisingDistricts from './components/RisingDistricts.jsx'
import TypeChart from './components/TypeChart.jsx'
import TrendChart from './components/TrendChart.jsx'
import LiveFeed from './components/LiveFeed.jsx'

// WIREFRAME: layout + data wiring only. Visual style comes from the team's Pinterest direction.
export default function Dashboard() {
  const { reports, source, updatedAt } = useReports()
  const [filters, setFilters] = useState({ district: '', type: '', days: 30 })

  // Map + ranking ignore the district filter (so every district stays visible).
  const allDistricts = useMemo(() => filterReports(reports, { ...filters, district: '' }), [reports, filters])
  const filtered = useMemo(() => filterReports(reports, filters), [reports, filters])
  // Rising needs 14 days of history regardless of the time range.
  const forTrend = useMemo(() => filterReports(reports, { type: filters.type }), [reports, filters.type])

  const setDistrict = (district) => setFilters((f) => ({ ...f, district }))
  const setType = (type) => setFilters((f) => ({ ...f, type: f.type === type ? '' : type }))

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header source={source} updatedAt={updatedAt} />

      <main className="max-w-[1600px] mx-auto p-4 space-y-4">
        <FilterBar filters={filters} onChange={setFilters} />
        <KpiRow reports={filtered} />

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Reports by district" className="lg:col-span-2">
            <DistrictMap reports={allDistricts} selected={filters.district} onSelect={setDistrict} />
          </Panel>

          <Panel title="Rising districts · last 7 days vs previous 7">
            <RisingDistricts reports={forTrend} selected={filters.district} onSelect={setDistrict} />
          </Panel>

          <Panel title="Scam types">
            <TypeChart reports={filtered} onSelect={setType} />
          </Panel>

          <Panel title="Daily reports" className="lg:col-span-2">
            <TrendChart reports={filtered} days={filters.days} />
          </Panel>

          <Panel title="Latest reports" className="lg:col-span-3">
            <LiveFeed reports={filtered} />
          </Panel>
        </div>
      </main>
    </div>
  )
}
