import { useDashboard } from '../hooks/useDashboard.js'
import Tile from '../components/Tile.jsx'
import HeroTile from '../components/HeroTile.jsx'
import AlertTile from '../components/AlertTile.jsx'
import KpiTiles from '../components/KpiTiles.jsx'
import DistrictMap from '../components/DistrictMap.jsx'
import RisingDistricts from '../components/RisingDistricts.jsx'
import TypeChart from '../components/TypeChart.jsx'
import TrendChart from '../components/TrendChart.jsx'
import ActivityFeed from '../components/ActivityFeed.jsx'
import { MapIcon, TrendIcon, BarsIcon, PulseIcon, ClockIcon } from '../components/icons.jsx'

// Bento overview. Desktop: fits 100vh.
//  ┌──────────┬──────┬────┬────┐
//  │   Hero   │Alert │KPI │KPI │
//  │ (forest) │(red) │KPI │KPI │
//  ├──────────┴──┬───┴┬───┴────┤
//  │             │Rise│ Types  │
//  │     Map     ├────┼────────┤
//  │             │Trnd│Activity│
//  └─────────────┴────┴────────┘
export default function Overview() {
  const { filtered, scoped, allDistricts, forTrend, byDistrict, filters, setDistrict, toggleType } = useDashboard()

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[208px_minmax(0,1fr)_minmax(0,1fr)]">
      <HeroTile reports={forTrend} onSelect={setDistrict} className="col-span-12 lg:col-span-5 min-h-[208px]" />
      <AlertTile reports={byDistrict} onSelect={toggleType} className="col-span-12 md:col-span-5 lg:col-span-3 min-h-[180px]" />
      <div className="col-span-12 md:col-span-7 lg:col-span-4 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
        <KpiTiles filtered={filtered} scoped={scoped} days={filters.days} />
      </div>

      <Tile title="Reports by district" to="/official/map" icon={MapIcon} className="col-span-12 lg:col-span-6 lg:row-span-2">
        <div className="h-[380px] lg:h-full">
          <DistrictMap reports={allDistricts} selected={filters.district} onSelect={setDistrict} />
        </div>
      </Tile>

      <Tile title="Rising · 7 days" to="/official/trends" icon={TrendIcon} tint="bg-blush text-scam" className="col-span-12 md:col-span-6 lg:col-span-3" bodyClass="overflow-auto pr-1">
        <RisingDistricts reports={forTrend} selected={filters.district} onSelect={setDistrict} limit={6} />
      </Tile>

      <Tile title="Top scam types" to="/official/types" icon={BarsIcon} className="col-span-12 md:col-span-6 lg:col-span-3">
        <div className="h-56 lg:h-full">
          <TypeChart reports={filtered} selected={filters.type} onSelect={toggleType} limit={5} />
        </div>
      </Tile>

      <Tile title="Daily reports" to="/official/trends" icon={ClockIcon} tint="bg-sun-tint text-warn" className="col-span-12 md:col-span-6 lg:col-span-3">
        <div className="h-56 lg:h-full">
          <TrendChart reports={filtered} days={filters.days} />
        </div>
      </Tile>

      <Tile title="Latest activity" to="/official/activity" icon={PulseIcon} tint="bg-blush text-scam" className="col-span-12 md:col-span-6 lg:col-span-3" bodyClass="overflow-auto pr-1">
        <ActivityFeed reports={filtered} limit={8} compact />
      </Tile>
    </div>
  )
}
