import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { DISTRICTS } from '../shared/districts.js'
import { HomeIcon, SearchIcon, AlertIcon, BookIcon, ExitIcon } from './components/CitizenIcons.jsx'
import {
  getSavedDistrict,
  saveDistrict,
  getSavedLanguage,
  saveLanguage,
  getSavedScore,
} from './lib/citizenStorage.js'

export const CITIZEN_NAV = [
  { to: '/citizen', label: 'Home · होम', Icon: HomeIcon, end: true },
  { to: '/citizen/check', label: 'Check · जाँच', Icon: SearchIcon },
  { to: '/citizen/report', label: 'Report · शिकायत', Icon: AlertIcon },
  { to: '/citizen/learn', label: 'Learn · सीखें', Icon: BookIcon },
]

const Hint = ({ children }) => (
  <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-md bg-ink text-card text-xs font-medium whitespace-nowrap opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 z-[1000]">
    {children}
  </span>
)

const rail = ({ isActive }) =>
  `group relative grid place-items-center w-11 h-11 rounded-xl transition-colors ${
    isActive ? 'bg-card/20 text-card' : 'text-card/70 hover:bg-card/10 hover:text-card'
  }`

export default function CitizenLayout() {
  const [district, setDistrictState] = useState(getSavedDistrict)
  const [lang, setLangState] = useState(getSavedLanguage)
  const [score, setScore] = useState(getSavedScore)
  const location = useLocation()

  const handleDistrictChange = (d) => {
    setDistrictState(d)
    saveDistrict(d)
  }

  const handleLangChange = (l) => {
    setLangState(l)
    saveLanguage(l)
  }

  // Determine current page title
  const currentNav = CITIZEN_NAV.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  )
  const pageTitle =
    lang === 'cg'
      ? location.pathname.includes('check')
        ? 'जाँच'
        : location.pathname.includes('report')
        ? 'रपट'
        : location.pathname.includes('learn')
        ? 'सिखव'
        : 'सचेत संगवारी'
      : lang === 'en'
      ? location.pathname.includes('check')
        ? 'Verify Scam'
        : location.pathname.includes('report')
        ? 'File Report'
        : location.pathname.includes('learn')
        ? 'Learn Safety'
        : 'SACHET Citizen'
      : location.pathname.includes('check')
      ? 'धोखाधड़ी जाँच'
      : location.pathname.includes('report')
      ? 'शिकायत'
      : location.pathname.includes('learn')
      ? 'सुरक्षा पाठ'
      : 'सचेत नागरिक'

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-beige">
      {/* 1. SLIM DESKTOP ICON RAIL (SAME AS DASHBOARD SIDENAV) */}
      <aside className="hidden md:flex w-[64px] shrink-0 flex-col items-center bg-forest sticky top-0 self-start h-screen py-5 z-[1000]">
        <nav className="flex-1 flex flex-col justify-center gap-2" aria-label="Citizen Navigation">
          {CITIZEN_NAV.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={rail} aria-label={label}>
              <Icon size={20} />
              <Hint>{label}</Hint>
            </NavLink>
          ))}
        </nav>

        <Link to="/" className={rail({ isActive: false })} aria-label="Exit to landing">
          <ExitIcon size={20} />
          <Hint>मुख्य पृष्ठ (Home)</Hint>
        </Link>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top nav bar (same as Dashboard MobileNav) */}
        <nav className="md:hidden flex gap-1 overflow-x-auto bg-forest p-2">
          {CITIZEN_NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap ${
                  isActive ? 'bg-card/20 text-card' : 'text-card/70'
                }`
              }
            >
              <Icon size={18} />
              {label.split('·')[0]}
            </NavLink>
          ))}
        </nav>

        {/* 3. MINIMAL TOP BAR (SAME AS DASHBOARD TOPBAR) */}
        <header className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left: Title + Emergency 1930 Pill */}
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink">{pageTitle}</h1>

            {/* "Lost money? Call 1930" visible on every screen */}
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blush text-scam border border-scam/20 hover:brightness-95 transition-all shadow-xs"
              title="National Cyber Crime Helpline"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-scam opacity-60 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-scam" />
              </span>
              <span>{lang === 'cg' ? 'पैसा कट गे? 1930' : lang === 'en' ? 'Lost money? Call 1930' : 'पैसे कटे? कॉल 1930'}</span>
            </a>
          </div>

          {/* Right: District + Language + Official Link */}
          <div className="flex flex-wrap items-center gap-2">
            {/* District Selector */}
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="border border-line rounded-full px-3 py-1.5 text-sm bg-card text-ink focus:outline-none"
            >
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Language Selector */}
            <div className="flex border border-line rounded-full overflow-hidden text-xs bg-card p-0.5">
              {[
                { id: 'hi', label: 'हिंदी' },
                { id: 'cg', label: 'छ.ग.' },
                { id: 'en', label: 'EN' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLangChange(l.id)}
                  className={`px-2.5 py-1 rounded-full font-medium transition ${
                    lang === l.id ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Switch to Official */}
            <Link
              to="/official"
              className="text-xs font-semibold text-forest hover:underline px-1 hidden sm:inline"
            >
              Official view →
            </Link>
          </div>
        </header>

        {/* 4. MAIN PAGE VIEWPORT */}
        <main className="flex-1 min-h-0 px-5 pb-5 overflow-y-auto">
          <Outlet context={{ district, lang, score, setScore }} />
        </main>
      </div>
    </div>
  )
}
