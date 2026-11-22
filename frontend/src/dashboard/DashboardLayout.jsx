import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useReports } from './hooks/useReports.js'
import { filterReports } from './lib/stats.js'
import SideNav, { MobileNav, getNav } from './components/SideNav.jsx'
import TopBar from './components/TopBar.jsx'
import { DASHBOARD_T } from './data/translations.js'

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
  const title = navItems.find((n) => n.to === pathname.replace(/\/$/, ''))?.label ?? (t.navOverview || 'Overview')

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-beige">
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
        />
        <main className="flex-1 min-h-0 px-5 pb-5">
          <Outlet context={{ ...data, filters, setDistrict, toggleType, lang, setLang: handleLangChange, t }} />
        </main>
      </div>
    </div>
  )
}
