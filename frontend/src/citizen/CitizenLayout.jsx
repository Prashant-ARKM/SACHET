import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import DistrictModal from './components/DistrictModal.jsx'
import { T } from './data/translations.js'
import {
  getSavedDistrict,
  saveDistrict,
  getSavedLanguage,
  saveLanguage,
  getSavedScore,
} from './lib/citizenStorage.js'

export default function CitizenLayout() {
  const [district, setDistrictState] = useState(getSavedDistrict)
  const [lang, setLangState] = useState(getSavedLanguage)
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [score, setScore] = useState(getSavedScore)
  const location = useLocation()

  const t = T[lang] || T.hi

  // Check if first-time user (prompt for district if not set explicitly)
  useEffect(() => {
    const saved = localStorage.getItem('sachet_citizen_district')
    if (!saved) {
      setIsDistrictModalOpen(true)
    }
  }, [])

  // Offline / Online listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSelectDistrict = (newDist) => {
    setDistrictState(newDist)
    saveDistrict(newDist)
  }

  const handleSelectLanguage = (newLang) => {
    setLangState(newLang)
    saveLanguage(newLang)
  }

  const navItems = [
    {
      to: '/citizen',
      end: true,
      label: t.navHome,
      sub: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/citizen/check',
      label: t.navCheck,
      sub: 'Check',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      to: '/citizen/report',
      label: t.navReport,
      sub: 'Report',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      to: '/citizen/learn',
      label: t.navLearn,
      sub: 'Learn',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-beige text-ink">
      {/* 1. PERSISTENT EMERGENCY BANNER (VISIBLE ON EVERY SCREEN) */}
      <div className="bg-scam text-card px-4 py-2.5 shadow-md sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-3 w-3 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sun opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div className="truncate">
              <p className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-1.5">
                <span>{t.emergencyBanner}</span>
              </p>
              <p className="text-xs text-card/85 hidden sm:block">
                {t.emergencySub}
              </p>
            </div>
          </div>
          <a
            href="tel:1930"
            className="shrink-0 bg-white text-scam font-bold text-sm sm:text-base px-4 py-1.5 rounded-full shadow-sm hover:bg-sun-tint active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>📞</span>
            <span>{t.callNow}</span>
          </a>
        </div>
      </div>

      {/* Offline Alert Bar */}
      {isOffline && (
        <div className="bg-warn/15 border-b border-warn/30 text-warn text-xs sm:text-sm px-4 py-1.5 text-center font-medium">
          📡 {t.offlineNotice}
        </div>
      )}

      {/* Top Header / App Brand & Controls */}
      <header className="bg-card/90 backdrop-blur-md border-b border-line px-4 py-3 sticky top-[46px] z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Brand */}
          <Link to="/citizen" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-forest text-card flex items-center justify-center font-display font-bold text-xl shadow-xs group-hover:scale-105 transition-transform">
              स
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg sm:text-xl text-ink leading-none">
                  {t.appName}
                </span>
                <span className="text-[10px] bg-mint text-forest px-1.5 py-0.5 rounded-md font-semibold tracking-wider">
                  CG
                </span>
              </div>
              <p className="text-[11px] text-muted font-medium hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </Link>

          {/* District & Language Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* District Pill */}
            <button
              type="button"
              onClick={() => setIsDistrictModalOpen(true)}
              className="bg-beige hover:bg-line text-ink border border-line px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>📍</span>
              <span className="max-w-[100px] sm:max-w-[150px] truncate">{district}</span>
              <span className="text-muted text-[10px] hidden sm:inline">({t.changeDistrict})</span>
            </button>

            {/* Language Switcher */}
            <div className="bg-beige p-0.5 rounded-full border border-line flex text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleSelectLanguage('hi')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  lang === 'hi' ? 'bg-forest text-card shadow-xs' : 'text-muted hover:text-ink'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage('cg')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  lang === 'cg' ? 'bg-forest text-card shadow-xs' : 'text-muted hover:text-ink'
                }`}
              >
                छ.ग.
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className={`px-2 py-1 rounded-full transition-all ${
                  lang === 'en' ? 'bg-forest text-card shadow-xs' : 'text-muted hover:text-ink'
                }`}
              >
                Eng
              </button>
            </div>

            {/* Official Dashboard Link */}
            <Link
              to="/official"
              className="hidden md:inline-flex text-xs font-semibold text-muted hover:text-forest items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-beige transition-colors"
            >
              <span>अधिकारी</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container: Desktop Side Nav + Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex pb-24 lg:pb-8">
        {/* Desktop Side Nav */}
        <aside className="hidden lg:flex flex-col w-64 p-5 shrink-0 border-r border-line/70 min-h-[calc(100vh-120px)] sticky top-[108px] self-start space-y-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-bold transition-all ${
                    isActive
                      ? 'bg-forest text-card shadow-md scale-[1.02]'
                      : 'text-ink/80 hover:bg-mint/50 hover:text-forest'
                  }`
                }
              >
                {item.icon}
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="text-[11px] font-normal opacity-70">{item.sub}</span>
                </div>
              </NavLink>
            ))}
          </nav>

          {/* Quick Score Card on Desktop Side Nav */}
          <div className="bg-card p-4 rounded-2xl border border-line shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-muted mb-2">
              <span>{t.bentoLearnScoreLabel}</span>
              <span className="text-forest font-extrabold">{score}/100</span>
            </div>
            <div className="w-full bg-line rounded-full h-2 overflow-hidden mb-3">
              <div
                className="bg-leaf h-full rounded-full transition-all duration-500"
                style={{ width: `${score}%` }}
              ></div>
            </div>
            <Link
              to="/citizen/learn"
              className="text-xs font-bold text-forest hover:underline flex items-center justify-between"
            >
              <span>{t.bentoLearnContinue}</span>
              <span>→</span>
            </Link>
          </div>

          {/* Emergency 1930 Helper Tile */}
          <div className="bg-blush p-4 rounded-2xl border border-scam/30 text-scam space-y-2">
            <p className="font-bold text-sm">आपातकालीन साइबर हेल्पलाइन</p>
            <p className="text-xs leading-relaxed text-ink/80">
              धोखाधड़ी होते ही 1930 पर कॉल करें। कोई बैंक कभी पिन या OTP नहीं मांगता।
            </p>
            <a
              href="tel:1930"
              className="w-full bg-scam text-card font-bold text-sm py-2 px-3 rounded-xl flex items-center justify-center gap-2 hover:bg-scam/90 transition-colors shadow-xs"
            >
              <span>📞 1930 डायल करें</span>
            </a>
          </div>
        </aside>

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 pt-5">
          <Outlet context={{ district, lang, t, score, setScore }} />
        </main>
      </div>

      {/* 2. MOBILE BOTTOM BAR (HOME · CHECK · REPORT · LEARN) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card border-t border-line shadow-2xl z-40 px-2 py-1.5 flex items-center justify-around safe-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[68px] py-1 px-2 rounded-2xl transition-all ${
                isActive
                  ? 'bg-forest text-card font-bold shadow-sm scale-105'
                  : 'text-muted hover:text-ink font-semibold'
              }`
            }
          >
            <div className="mb-0.5">{item.icon}</div>
            <span className="text-xs leading-none">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* District Selection Modal */}
      <DistrictModal
        isOpen={isDistrictModalOpen}
        onClose={() => setIsDistrictModalOpen(false)}
        currentDistrict={district}
        onSelect={handleSelectDistrict}
        lang={lang}
      />
    </div>
  )
}

