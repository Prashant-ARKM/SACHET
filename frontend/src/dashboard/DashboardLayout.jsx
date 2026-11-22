import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useReports } from './hooks/useReports.js'
import { filterReports } from './lib/stats.js'
import SideNav, { MobileNav, NAV } from './components/SideNav.jsx'
import TopBar from './components/TopBar.jsx'

// Shared shell: side nav + top bar + filters. Data is fetched once here and
// passed to every page through the outlet context (use useDashboard()).
// Desktop (lg+): everything fits in 100vh, no page scroll. Smaller: normal scroll.
export default function DashboardLayout() {
  const { reports, source, updatedAt } = useReports()
  const [filters, setFilters] = useState({ district: '', type: '', days: 30 })
  const { pathname } = useLocation()

  const data = useMemo(() => {
    // filtered: every filter applied
    // allDistricts: ignores the district filter (map + rankings keep every district)
    // forTrend: type filter only (rising needs 14 days of history)
    return {
      reports,
      filtered: filterReports(reports, filters),
      allDistricts: filterReports(reports, { ...filters, district: '' }),
      forTrend: filterReports(reports, { type: filters.type }),
      // scoped: district + type, every date (sparklines, "vs before")
      scoped: filterReports(reports, { ...filters, days: 0 }),
      // byDistrict: district only (fastest-spreading scam type)
      byDistrict: filterReports(reports, { district: filters.district }),
    }
  }, [reports, filters])

  const setDistrict = (district) => setFilters((f) => ({ ...f, district }))
  const toggleType = (type) => setFilters((f) => ({ ...f, type: f.type === type ? '' : type }))

  const title = NAV.find((n) => n.to === pathname.replace(/\/$/, ''))?.label ?? 'Overview'

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-beige">
      <SideNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav />
        <TopBar title={title} source={source} updatedAt={updatedAt} filters={filters} onChange={setFilters} />
        <main className="flex-1 min-h-0 px-5 pb-5">
          <Outlet context={{ ...data, filters, setDistrict, toggleType }} />
        </main>
      </div>
    </div>
  )
}
