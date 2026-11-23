import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useReports } from './hooks/useReports.js'
import { filterReports } from './lib/stats.js'
import SideNav, { MobileNav, getNav } from './components/SideNav.jsx'
import TopBar from './components/TopBar.jsx'
import { DASHBOARD_T } from './data/translations.js'
import ScanLoader from '../shared/loading/ScanLoader.jsx'
import PageGate from '../shared/loading/PageGate.jsx'
import { useEntryLoader } from '../shared/loading/useEntryLoader.js'
import { DashboardOverviewSkeleton, DashboardPageSkeleton } from '../shared/loading/Skeletons.jsx'

// Shared shell: side nav + top bar + filters + language switcher.
export default function DashboardLayout() {
  const { reports, source, updatedAt } = useReports()
  const [filters, setFilters] = useState({ district: '', type: '', days: 30 })
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('sachet_official_lang') || 'en'
    } catch {
      return 'en'
    }
  })
  const { pathname } = useLocation()

  const handleLangChange = (l) => {
    setLang(l)
    try {
      localStorage.setItem('sachet_official_lang', l)
    } catch {}
  }

  const t = useMemo(() => DASHBOARD_T[lang] || DASHBOARD_T.en, [lang])

  const data = useMemo(() => {
    return {
      reports,
      filtered: filterReports(reports, filters),
      allDistricts: filterReports(reports, { ...filters, district: '' }),
      forTrend: filterReports(reports, { type: filters.type }),
      scoped: filterReports(reports, { ...filters, days: 0 }),
      byDistrict: filterReports(reports, { district: filters.district }),
    }
  }, [reports, filters])

  const setDistrict = (district) => setFilters((f) => ({ ...f, district }))
  const toggleType = (type) => setFilters((f) => ({ ...f, type: f.type === type ? '' : type }))

  const navItems = getNav(t)
  const isOverview = pathname.replace(/\/$/, '') === '/official'
  const isMapPage = pathname.replace(/\/$/, '') === '/official/map'
  const isCampaign = pathname.replace(/\/$/, '') === '/official/campaign'
  const showFilters = !isMapPage && !isCampaign
  // Message-scan loader when entering the dashboard, then skeletons
  const [entering, doneEntering] = useEntryLoader()
  const title = navItems.find((n) => n.to === pathname.replace(/\/$/, ''))?.label ?? (t.navOverview || 'Overview')

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-beige">
      {entering && <ScanLoader target="official" lang={lang} onDone={doneEntering} />}
      <SideNav t={t} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav t={t} />
        <TopBar
          title={title}
          source={source}
          updatedAt={updatedAt}
          filters={filters}
          onChange={setFilters}
          lang={lang}
          onLangChange={handleLangChange}
          t={t}
          showFilters={showFilters}
        />
        <main className="flex-1 min-h-0 px-4 md:px-5 pb-28 md:pb-5">
          <PageGate
            key={pathname}
            hold={entering}
            className="lg:h-full"
            skeleton={isOverview ? <DashboardOverviewSkeleton /> : <DashboardPageSkeleton />}
          >
            <Outlet context={{ ...data, filters, setDistrict, toggleType, lang, setLang: handleLangChange, t }} />
          </PageGate>
        </main>
      </div>
    </div>
  )
}
