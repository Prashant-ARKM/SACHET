import { useDashboard } from '../hooks/useDashboard.js'
import Tile from '../components/Tile.jsx'
import { MapIcon, BarsIcon } from '../components/icons.jsx'
import DistrictMap from '../components/DistrictMap.jsx'
import DistrictTable from '../components/DistrictTable.jsx'

export default function MapPage() {
  const { allDistricts, forTrend, filters, setDistrict, lang, t } = useDashboard()

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-full lg:grid-rows-[minmax(0,1fr)]">
      <Tile title={t?.mapTileCircleFilter || 'Reports by district · click a circle to filter'} icon={MapIcon} className="col-span-12 lg:col-span-7">
        <div className="h-[480px] lg:h-full">
          <DistrictMap reports={allDistricts} selected={filters.district} onSelect={setDistrict} t={t} />
        </div>
      </Tile>
      <Tile title={t?.allDistrictsTitle || 'All districts'} icon={BarsIcon} className="col-span-12 lg:col-span-5" bodyClass="overflow-auto max-h-[480px] lg:max-h-none">
        <DistrictTable reports={allDistricts} trendReports={forTrend} selected={filters.district} onSelect={setDistrict} lang={lang} t={t} />
      </Tile>
    </div>
  )
}
