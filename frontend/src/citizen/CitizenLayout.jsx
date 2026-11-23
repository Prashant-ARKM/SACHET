import { useState, useMemo } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { DISTRICTS } from '../shared/districts.js'
import BackToStart from '../shared/BackToStart.jsx'
import { T } from './data/translations.js'
import ScanLoader from '../shared/loading/ScanLoader.jsx'
import PageGate from '../shared/loading/PageGate.jsx'
import { useEntryLoader } from '../shared/loading/useEntryLoader.js'
import { CitizenHomeSkeleton, CitizenPageSkeleton } from '../shared/loading/Skeletons.jsx'
import { HomeIcon, SearchIcon, AlertIcon, BookIcon, ExitIcon, PhoneIcon } from './components/CitizenIcons.jsx'
import {
  getSavedDistrict,
  saveDistrict,
  getSavedLanguage,
  saveLanguage,
  getSavedScore,
} from './lib/citizenStorage.js'

const LANGS = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'hi', label: 'हिंदी', short: 'हिं' },
  { id: 'cg', label: 'छत्तीसगढ़ी', short: 'छ.ग.' },
]

// Phone only: one language button that opens a list of big options.
function LangMenu({ lang, onChange }) {
  const [open, setOpen] = useState(false)
  const current = LANGS.find((l) => l.id === lang) || LANGS[0]
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Language"
        className="flex items-center gap-2 h-12 px-4 rounded-full bg-card border border-line text-base font-semibold text-ink"
      >
        <span className="grid place-items-center w-7 h-7 rounded-full bg-mint text-forest text-sm font-bold">अ</span>
        {current.short}
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-14 z-50 w-56 bg-card border border-line rounded-2xl p-2 shadow-[0_16px_40px_-12px_rgba(31,77,51,0.35)]">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  onChange(l.id)
                  setOpen(false)
                }}
                className={`w-full text-left h-14 px-4 rounded-xl text-lg font-semibold ${
                  lang === l.id ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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
  const [lang, setLangState] = useState(getSavedLanguage) // default is now 'en'
  const [score, setScore] = useState(getSavedScore)
  const location = useLocation()
  const isHome = location.pathname.replace(/\/$/, '') === '/citizen'
  // Message-scan loader when entering the citizen app, then skeletons
  const [entering, doneEntering] = useEntryLoader()

  const t = useMemo(() => T[lang] || T.en, [lang])

  const handleDistrictChange = (d) => {
    setDistrictState(d)
    saveDistrict(d)
  }

  const handleLangChange = (l) => {
    setLangState(l)
    saveLanguage(l)
  }

  // Dynamic Nav Items based on active language
  const navItems = [
    { to: '/citizen', label: t.navHome, Icon: HomeIcon, end: true },
    { to: '/citizen/check', label: t.navCheck, Icon: SearchIcon },
    { to: '/citizen/report', label: t.navReport, Icon: AlertIcon },
    { to: '/citizen/learn', label: t.navLearn, Icon: BookIcon },
  ]

  // Page title resolution
  const pageTitle =
    location.pathname.endsWith('/check')
      ? t.navCheck
      : location.pathname.endsWith('/report')
      ? t.navReport
      : location.pathname.endsWith('/learn')
      ? t.navLearn
      : t.appName

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-beige">
      {entering && <ScanLoader target="citizen" lang={lang} onDone={doneEntering} />}
      {/* 1. SLIM DESKTOP ICON RAIL (SAME AS DASHBOARD SIDENAV) */}
      <aside className="hidden md:flex w-[64px] shrink-0 flex-col items-center bg-forest sticky top-0 self-start h-screen py-5 z-[1000]">
        <nav className="flex-1 flex flex-col justify-center gap-2" aria-label="Citizen Navigation">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={rail} aria-label={label}>
              <Icon size={20} />
              <Hint>{label}</Hint>
            </NavLink>
          ))}
        </nav>

        <Link to="/" className={rail({ isActive: false })} aria-label="Exit to landing">
          <ExitIcon size={20} />
          <Hint>{lang === 'cg' ? 'मुख्य पृष्ठ' : lang === 'hi' ? 'मुख्य पृष्ठ' : 'Exit'}</Hint>
        </Link>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* PHONE HEADER: logo + page title + one language button */}
        <header className="md:hidden flex items-center justify-between gap-3 px-4 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <BackToStart lang={lang} />
            <span className="font-display text-xl min-[380px]:text-2xl font-bold text-ink truncate">{pageTitle}</span>
          </div>
          <LangMenu lang={lang} onChange={handleLangChange} />
        </header>

        {/* 3. MINIMAL TOP BAR */}
        <header className="hidden md:flex px-5 py-4 flex-wrap items-center justify-between gap-3 shrink-0">
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
              <span>{t.emergencyBanner}</span>
            </a>
          </div>

          {/* Right: District + Language Switcher + Official Link */}
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

            {/* Language Selector: English (Default), Hindi, Chhattisgarhi */}
            <div className="flex border border-line rounded-full overflow-hidden text-xs bg-card p-0.5">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLangChange(l.id)}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    lang === l.id ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
                  }`}
                >
                  {l.id === 'cg' ? 'छ.ग.' : l.label}
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
        <main className="flex-1 min-h-0 px-4 md:px-5 pb-32 md:pb-5 overflow-y-auto">
          <PageGate
            key={location.pathname}
            hold={entering}
            skeleton={isHome ? <CitizenHomeSkeleton /> : <CitizenPageSkeleton />}
          >
            <Outlet context={{ district, setDistrict: handleDistrictChange, lang, t, score, setScore }} />
          </PageGate>
        </main>
      </div>

      {/* PHONE BOTTOM BAR: Home · Check · [Call 1930] · Report · Learn */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-forest text-card px-2 pt-2"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        aria-label="Citizen Navigation"
      >
        <div className="grid grid-cols-5 items-end">
          {navItems.slice(0, 2).map((item) => (
            <BottomTab key={item.to} {...item} />
          ))}
          <a href="tel:1930" className="flex flex-col items-center gap-1 -mt-7" aria-label={t.callNow}>
            <span className="grid place-items-center w-16 h-16 rounded-full bg-scam text-card border-4 border-beige shadow-[0_8px_20px_-6px_rgba(179,38,30,0.7)]">
              <PhoneIcon size={26} />
            </span>
            <span className="text-[13px] font-bold leading-none pb-1">1930</span>
          </a>
          {navItems.slice(2).map((item) => (
            <BottomTab key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  )
}

function BottomTab({ to, label, Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 h-16 mx-0.5 rounded-2xl text-[13px] font-semibold leading-none transition-colors ${
          isActive ? 'bg-card/20 text-card' : 'text-card/75'
        }`
      }
    >
      <Icon size={24} />
      <span className="truncate max-w-full px-1">{label}</span>
    </NavLink>
  )
}
