import { Routes, Route, Link } from 'react-router-dom'
import DashboardLayout from './dashboard/DashboardLayout.jsx'
import Overview from './dashboard/pages/Overview.jsx'
import MapPage from './dashboard/pages/MapPage.jsx'
import TrendsPage from './dashboard/pages/TrendsPage.jsx'
import TypesPage from './dashboard/pages/TypesPage.jsx'
import ActivityPage from './dashboard/pages/ActivityPage.jsx'

// Citizen App (U2)
import CitizenLayout from './citizen/CitizenLayout.jsx'
import CitizenHome from './citizen/pages/CitizenHome.jsx'
import CitizenCheck from './citizen/pages/CitizenCheck.jsx'
import CitizenReport from './citizen/pages/CitizenReport.jsx'
import CitizenLearn from './citizen/pages/CitizenLearn.jsx'

// Clean, Minimalist SACHET Launch View
function LaunchPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-beige text-ink p-5 sm:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest text-card flex items-center justify-center font-display font-bold text-lg shadow-xs">
            स
          </div>
          <div>
            <span className="font-display font-bold text-lg text-ink">SACHET</span>
            <span className="ml-1.5 text-[10px] font-semibold tracking-wider uppercase text-muted">
              CHHATTISGARH
            </span>
          </div>
        </div>

        <a
          href="tel:1930"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blush text-scam border border-scam/20 hover:brightness-95 transition-all shadow-xs"
        >
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-scam opacity-60 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-scam" />
          </span>
          <span>पैसे कटे? कॉल 1930</span>
        </a>
      </header>

      {/* Main Persona Selector */}
      <main className="max-w-xl w-full mx-auto my-auto text-center space-y-6 py-6">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted mb-1">
            CYBER SAFETY PLATFORM · साइबर सुरक्षा
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            सचेत छत्तीसगढ़
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            कृपया अपनी भूमिका चुनें (Select your portal)
          </p>
        </div>

        {/* 2 Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Citizen Portal */}
          <Link
            to="/citizen"
            className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)] transition duration-200 flex flex-col justify-between space-y-5"
          >
            <div>
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-mint text-forest mb-3 text-base">
                🛡️
              </span>
              <h2 className="text-xl font-bold font-display text-ink leading-tight">
                मैं नागरिक हूँ
              </h2>
              <p className="text-xs text-muted mt-1">
                संदेश व लिंक की जाँच, 1930 हेल्पलाइन, अनाम रिपोर्ट और सुरक्षा पाठ।
              </p>
            </div>

            <div className="rounded-full bg-forest text-card text-xs font-semibold py-2 px-4 text-center">
              नागरिक पोर्टल →
            </div>
          </Link>

          {/* Official Dashboard */}
          <Link
            to="/official"
            className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(31,77,51,0.25)] transition duration-200 flex flex-col justify-between space-y-5"
          >
            <div>
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-sun-tint text-warn mb-3 text-base">
                🏛️
              </span>
              <h2 className="text-xl font-bold font-display text-ink leading-tight">
                मैं अधिकारी हूँ
              </h2>
              <p className="text-xs text-muted mt-1">
                33 ज़िलों के हॉटस्पॉट मैप, रुझान, लाइव फीड और फ्रॉड विश्लेषण।
              </p>
            </div>

            <div className="rounded-full bg-beige border border-line text-ink text-xs font-semibold py-2 px-4 text-center">
              डैशबोर्ड खोलें →
            </div>
          </Link>
        </div>

        {/* Minimal helpline notice */}
        <p className="text-xs text-muted">
          आपातकाल: किसी भी वित्तीय धोखाधड़ी पर तत्काल <a href="tel:1930" className="text-scam font-bold underline">1930</a> डायल करें।
        </p>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-[11px] text-muted py-2">
        SACHET Chhattisgarh · साइबर अपराध नियंत्रण एवं नागरिक सहायता
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LaunchPage />} />

      {/* Citizen App (U2) */}
      <Route path="/citizen" element={<CitizenLayout />}>
        <Route index element={<CitizenHome />} />
        <Route path="check" element={<CitizenCheck />} />
        <Route path="report" element={<CitizenReport />} />
        <Route path="learn" element={<CitizenLearn />} />
      </Route>

      {/* Official Dashboard (U1) */}
      <Route path="/official" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="map" element={<MapPage />} />
        <Route path="trends" element={<TrendsPage />} />
        <Route path="types" element={<TypesPage />} />
        <Route path="activity" element={<ActivityPage />} />
      </Route>
    </Routes>
  )
}
