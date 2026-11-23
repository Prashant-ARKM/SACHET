import { useState, useMemo } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { DISTRICTS } from '../shared/districts.js'
import { T } from './data/translations.js'
import ScanLoader from '../shared/loading/ScanLoader.jsx'
import PageGate from '../shared/loading/PageGate.jsx'
import { useEntryLoader } from '../shared/loading/useEntryLoader.js'
import { CitizenHomeSkeleton, CitizenPageSkeleton } from '../shared/loading/Skeletons.jsx'
import {
  HomeIcon,
  SearchIcon,
  AlertIcon,
  BookIcon,
  PhoneIcon,
  UserLoginIcon,
  ChevronDownIcon,
} from './components/CitizenIcons.jsx'
import {
  EmblemOfIndia,
  DigitalIndiaLogo,
  NicLogo,
} from './components/GovGraphics.jsx'
import DistrictModal from './components/DistrictModal.jsx'
import {
  getSavedDistrict,
  saveDistrict,
  getSavedLanguage,
  saveLanguage,
  getSavedScore,
} from './lib/citizenStorage.js'

const LANGS = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'hi', label: 'हिंदी (Hindi)', short: 'हिं' },
  { id: 'cg', label: 'छत्तीसगढ़ी (Chhattisgarhi)', short: 'छ.ग.' },
]

export default function CitizenLayout() {
  const [district, setDistrictState] = useState(getSavedDistrict)
  const [lang, setLangState] = useState(getSavedLanguage)
  const [score, setScore] = useState(getSavedScore)
  const [districtModalOpen, setDistrictModalOpen] = useState(false)
  const [fontSizeIndex, setFontSizeIndex] = useState(1) // 0: A-, 1: A, 2: A+
  const [highContrast, setHighContrast] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const location = useLocation()
  const isHome = location.pathname.replace(/\/$/, '') === '/citizen'
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

  const fontScaleClass =
    fontSizeIndex === 0 ? 'text-[14.5px]' : fontSizeIndex === 2 ? 'text-[17.5px]' : 'text-[16px]'

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F9F7F0] text-ink font-sans transition-colors duration-200 ${fontScaleClass} ${
        highContrast ? 'contrast-125' : ''
      }`}
    >
      {entering && <ScanLoader target="citizen" lang={lang} onDone={doneEntering} />}

      {/* ========================================================= */}
      {/* 1. TOP UTILITY & IDENTITY HEADER (OFFICIAL GOV OF INDIA)   */}
      {/* ========================================================= */}
      <header className="bg-[#FAF8F2] border-b border-[#E8E2D2] shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Left: National Emblem & Ministry Identity */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link to="/citizen" className="shrink-0 flex items-center gap-3" aria-label="Home">
              <EmblemOfIndia className="h-10 sm:h-12 w-auto text-[#1E2A22]" />
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-[11px] sm:text-[13px] text-[#14261C] tracking-tight">
                  भारत सरकार <span className="font-semibold text-[10px] sm:text-[12px] opacity-80">Government of India</span>
                </span>
                <span className="text-[9.5px] sm:text-[11px] text-[#4A5D50] font-medium leading-none mt-0.5">
                  इलेक्ट्रॉनिकी और सूचना प्रौद्योगिकी मंत्रालय
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#4A5D50] font-normal leading-none mt-0.5 hidden xs:block">
                  Ministry of Electronics and Information Technology
                </span>
              </div>
            </Link>

            {/* Vertical Divider */}
            <div className="hidden sm:block w-[1.5px] h-9 bg-[#E65100]/60 mx-1" />

            {/* Portal Branding */}
            <Link to="/citizen" className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-extrabold text-base sm:text-lg text-[#14261C] tracking-tight">
                SACHET Citizen
              </span>
              <span className="text-[10.5px] text-[#4A5D50] font-medium tracking-wide">
                Citizen Cyber Safety Portal
              </span>
            </Link>
          </div>

          {/* Right: Accessibility Controls & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs shrink-0">
            {/* Skip to main content link */}
            <a
              href="#main-citizen-content"
              className="hidden lg:inline text-[#4A5D50] hover:text-forest underline font-medium"
            >
              Skip to Main Content
            </a>
            <span className="hidden lg:inline text-[#D8CEBA]">|</span>

            {/* Font Size Adjusters: A-  A  A+ */}
            <div className="flex items-center gap-1 font-semibold text-[#1E2A22]">
              <button
                type="button"
                onClick={() => setFontSizeIndex(0)}
                title="Decrease font size"
                className={`px-1 hover:text-forest transition ${fontSizeIndex === 0 ? 'text-forest font-bold underline' : 'opacity-70'}`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSizeIndex(1)}
                title="Default font size"
                className={`px-1 hover:text-forest transition ${fontSizeIndex === 1 ? 'text-forest font-bold underline' : 'opacity-70'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeIndex(2)}
                title="Increase font size"
                className={`px-1 hover:text-forest transition ${fontSizeIndex === 2 ? 'text-forest font-bold underline' : 'opacity-70'}`}
              >
                A+
              </button>
            </div>
            <span className="text-[#D8CEBA]">|</span>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={() => setHighContrast((c) => !c)}
              title="Toggle Contrast"
              className="p-1 rounded-full text-ink hover:text-forest transition"
              aria-label="High Contrast"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 0 1-8-8 8 8 0 0 1 8-8z" />
                <path d="M12 4v16a8 8 0 0 0 0-16z" />
              </svg>
            </button>
            <span className="text-[#D8CEBA]">|</span>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <select
                value={lang}
                onChange={(e) => handleLangChange(e.target.value)}
                aria-label="Select Language"
                className="bg-card border border-[#E0D8C6] text-ink font-semibold text-xs rounded-lg py-1 px-2.5 pr-7 focus:outline-none focus:border-forest cursor-pointer appearance-none shadow-2xs"
              >
                {LANGS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted">
                ▼
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. PRIMARY HORIZONTAL NAVIGATION BAR (FOREST GREEN)       */}
      {/* ========================================================= */}
      <nav
        className="bg-[#183B2B] text-card sticky top-0 z-40 shadow-md"
        aria-label="Citizen Primary Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-13">
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* 1. Home */}
            <NavLink
              to="/citizen"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive ? 'bg-[#25523D] text-white shadow-xs' : 'text-white/85 hover:bg-[#25523D]/60 hover:text-white'
                }`
              }
            >
              <HomeIcon size={16} />
              <span>{t.navHome}</span>
            </NavLink>

            {/* 2. Verify & Check */}
            <NavLink
              to="/citizen/check"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-[#25523D] text-white shadow-xs' : 'text-white/85 hover:bg-[#25523D]/60 hover:text-white'
                }`
              }
            >
              <span>{t.navCheck}</span>
              <span className="text-[10px] opacity-70">▾</span>
            </NavLink>

            {/* 3. Report Cybercrime */}
            <NavLink
              to="/citizen/report"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-[#25523D] text-white shadow-xs' : 'text-white/85 hover:bg-[#25523D]/60 hover:text-white'
                }`
              }
            >
              <span>{t.navReport}</span>
            </NavLink>

            {/* 4. Alerts & Updates */}
            <button
              type="button"
              onClick={() => setDistrictModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/85 hover:bg-[#25523D]/60 hover:text-white transition cursor-pointer"
            >
              <span>{lang === 'hi' ? 'अलर्ट व अपडेट्स' : lang === 'cg' ? 'अलर्ट अउ अपडेट' : 'Alerts & Updates'}</span>
              <span className="text-[10.5px] bg-sun text-ink font-bold px-1.5 py-0.2 rounded-full">
                {district}
              </span>
            </button>

            {/* 5. Awareness & Resources */}
            <NavLink
              to="/citizen/learn"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-[#25523D] text-white shadow-xs' : 'text-white/85 hover:bg-[#25523D]/60 hover:text-white'
                }`
              }
            >
              <BookIcon size={15} />
              <span>{t.navLearn}</span>
              <span className="text-[10px] opacity-70">▾</span>
            </NavLink>

            {/* 6. Support */}
            <a
              href="tel:1930"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/85 hover:bg-[#25523D]/60 hover:text-white transition"
            >
              <PhoneIcon size={14} />
              <span>{lang === 'hi' ? 'सहायता (1930)' : lang === 'cg' ? 'मदद (1930)' : 'Support (1930)'}</span>
            </a>
          </div>

          {/* Right: Citizen Login / Official Access Button */}
          <div className="flex items-center gap-3">
            <Link
              to="/official"
              className="inline-flex items-center gap-2 bg-[#FFFDF8] hover:bg-white text-[#183B2B] text-xs font-bold px-4 py-2 rounded-full shadow-xs active:scale-95 transition"
            >
              <UserLoginIcon size={14} />
              <span>Citizen Login</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-white/90 hover:bg-[#25523D]"
              aria-label="Toggle navigation menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#143325] border-t border-white/10 px-4 py-3 space-y-1.5 text-sm animate-fadeIn">
            <NavLink
              to="/citizen"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-white font-medium hover:bg-[#24523D]"
            >
              <HomeIcon size={16} />
              <span>{t.navHome}</span>
            </NavLink>
            <NavLink
              to="/citizen/check"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-white font-medium hover:bg-[#24523D]"
            >
              <SearchIcon size={16} />
              <span>{t.navCheck}</span>
            </NavLink>
            <NavLink
              to="/citizen/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-white font-medium hover:bg-[#24523D]"
            >
              <AlertIcon size={16} />
              <span>{t.navReport}</span>
            </NavLink>
            <NavLink
              to="/citizen/learn"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-white font-medium hover:bg-[#24523D]"
            >
              <BookIcon size={16} />
              <span>{t.navLearn}</span>
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                setDistrictModalOpen(true)
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white font-medium hover:bg-[#24523D]"
            >
              <span>📍 {t.yourDistrict}</span>
              <span className="bg-sun text-ink font-bold text-xs px-2 py-0.5 rounded-full">{district}</span>
            </button>
            <a
              href="tel:1930"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-scam text-white font-bold"
            >
              <PhoneIcon size={16} />
              <span>Call 1930 (Helpline)</span>
            </a>
          </div>
        )}
      </nav>

      {/* ========================================================= */}
      {/* 3. MAIN PAGE VIEWPORT                                     */}
      {/* ========================================================= */}
      <main
        id="main-citizen-content"
        className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6"
      >
        <PageGate
          key={location.pathname}
          hold={entering}
          skeleton={isHome ? <CitizenHomeSkeleton /> : <CitizenPageSkeleton />}
        >
          <Outlet context={{ district, setDistrict: handleDistrictChange, lang, t, score, setScore }} />
        </PageGate>
      </main>

      {/* ========================================================= */}
      {/* 4. OFFICIAL GOVERNMENT FOOTER                             */}
      {/* ========================================================= */}
      <footer className="bg-[#142E22] text-white border-t border-[#1C4230] pt-8 pb-10 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10 text-center md:text-left">
            {/* Left: Gov Identity */}
            <div className="flex items-center gap-3">
              <EmblemOfIndia className="h-10 w-auto text-white/90" color="#FFFFFF" />
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  भारत सरकार
                </span>
                <span className="text-xs text-white/80 font-medium">
                  Government of India
                </span>
                <span className="text-[11px] text-white/60 mt-0.5">
                  Citizen Cyber Safety Portal · Chhattisgarh
                </span>
              </div>
            </div>

            {/* Center: Essential Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/75 font-medium">
              <Link to="/citizen" className="hover:text-white hover:underline transition">About SACHET</Link>
              <span>|</span>
              <a href="#" className="hover:text-white hover:underline transition">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-white hover:underline transition">Terms of Use</a>
              <span>|</span>
              <a href="#" className="hover:text-white hover:underline transition">Accessibility</a>
              <span>|</span>
              <a href="tel:1930" className="hover:text-white hover:underline transition">Contact Us</a>
              <span>|</span>
              <Link to="/official" className="hover:text-white hover:underline transition">Site Map</Link>
            </div>

            {/* Right: Partner Logos (Digital India & NIC) */}
            <div className="flex items-center gap-5 shrink-0">
              <DigitalIndiaLogo className="h-10 w-auto" />
              <NicLogo />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/50 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Ministry of Electronics and Information Technology (MeitY), Government of India.</p>
            <p>Designed for rapid cyber threat response & citizen financial protection.</p>
          </div>
        </div>
      </footer>

      {/* District Selection Modal */}
      <DistrictModal
        isOpen={districtModalOpen}
        onClose={() => setDistrictModalOpen(false)}
        currentDistrict={district}
        onSelect={handleDistrictChange}
        lang={lang}
      />
    </div>
  )
}
