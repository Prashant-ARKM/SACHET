import { useDashboard } from '../hooks/useDashboard.js'
import Tile from '../components/Tile.jsx'
import { ClockIcon, TrendIcon } from '../components/icons.jsx'
import TrendChart from '../components/TrendChart.jsx'
import RisingDistricts from '../components/RisingDistricts.jsx'

export default function TrendsPage() {
  const { filtered, forTrend, filters, setDistrict, t } = useDashboard()

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
      <Tile title={t?.tileDailyReports || 'Daily reports'} icon={ClockIcon} tint="bg-sun-tint text-warn" className="col-span-12">
        <div className="h-72 lg:h-full">
          <TrendChart reports={filtered} days={filters.days} />
        </div>
      </Tile>
      <Tile title={t?.trendsBusiest || 'Busiest districts · last 7 days vs previous 7'} icon={TrendIcon} tint="bg-blush text-scam" className="col-span-12 lg:col-span-6" bodyClass="overflow-auto pr-1">
        <RisingDistricts reports={forTrend} selected={filters.district} onSelect={setDistrict} limit={33} t={t} />
      </Tile>
      <Tile title={t?.trendsFalling || 'Falling districts · biggest drop'} icon={TrendIcon} className="col-span-12 lg:col-span-6" bodyClass="overflow-auto pr-1">
        <RisingDistricts reports={forTrend} selected={filters.district} onSelect={setDistrict} limit={33} order="falling" t={t} />
      </Tile>
    </div>
  )
}
