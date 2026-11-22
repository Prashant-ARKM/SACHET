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

// SACHET Welcome / Launch Screen
function LaunchPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-beige text-ink p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-forest text-card flex items-center justify-center font-display font-bold text-xl shadow-xs">
            स
          </div>
          <div>
            <span className="font-display font-bold text-xl text-ink">SACHET</span>
            <span className="ml-1.5 text-[10px] bg-mint text-forest px-2 py-0.5 rounded-md font-bold">
              छत्तीसगढ़
            </span>
          </div>
        </div>
        <a
          href="tel:1930"
          className="bg-blush text-scam border border-scam/30 text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full hover:bg-scam hover:text-card transition-colors flex items-center gap-1.5"
        >
          <span>📞</span>
          <span>1930 हेल्पलाइन</span>
        </a>
      </header>

      {/* Main Choice Card */}
      <main className="max-w-2xl w-full mx-auto my-auto text-center space-y-8 py-8">
        <div className="space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-leaf bg-mint px-3 py-1 rounded-full">
            साइबर सुरक्षा मंच • छत्तीसगढ़
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-ink leading-tight">
            सचेत पोर्टल में आपका स्वागत है
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-lg mx-auto">
            कृपया अपनी भूमिका चुनें — नागरिक सुरक्षा सहायता या अधिकृत साइबर क्राइम मॉनिटरिंग।
          </p>
        </div>

        {/* 2 Main Persona Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
          {/* 1. CITIZEN BUTTON */}
          <Link
            to="/citizen"
            className="group bg-card hover:bg-mint/30 border-2 border-forest rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 hover:scale-[1.02]"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-forest text-card flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <h2 className="text-2xl font-bold font-display text-ink group-hover:text-forest transition-colors">
                मैं नागरिक हूँ
                <span className="block text-xs font-normal text-muted mt-0.5">
                  I'm a Citizen
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-ink/80 leading-relaxed">
                फर्जी SMS, WhatsApp व कॉल की तुरंत जाँच करें, 1930 पर सहायता पाएं और 2 मिनट में अनाम शिकायत दर्ज करें।
              </p>
            </div>

            <div className="w-full bg-forest text-card font-bold text-base py-3 px-4 rounded-2xl text-center shadow-xs flex items-center justify-center gap-2 group-hover:bg-forest-2 transition-colors">
              <span>नागरिक डैशबोर्ड खोलें</span>
              <span>➔</span>
            </div>
          </Link>

          {/* 2. OFFICIAL BUTTON */}
          <Link
            to="/official"
            className="group bg-card hover:bg-beige border-2 border-line hover:border-forest/50 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 hover:scale-[1.01]"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-beige border border-line text-ink flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
                🏛️
              </div>
              <h2 className="text-2xl font-bold font-display text-ink group-hover:text-forest transition-colors">
                मैं अधिकारी हूँ
                <span className="block text-xs font-normal text-muted mt-0.5">
                  I'm an Official
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-ink/80 leading-relaxed">
                छत्तीसगढ़ के 33 ज़िलों में साइबर अपराध के हॉटस्पॉट, लाइव अलर्ट, रुझान और फ्रॉड प्रकारों की समीक्षा करें।
              </p>
            </div>

            <div className="w-full bg-beige hover:bg-line text-ink font-bold text-base py-3 px-4 rounded-2xl text-center border border-line flex items-center justify-center gap-2 transition-colors">
              <span>अधिकारी डैशबोर्ड</span>
              <span>➔</span>
            </div>
          </Link>
        </div>

        {/* Emergency Notice */}
        <div className="bg-blush border border-scam/30 p-4 rounded-2xl text-scam text-center space-y-1 max-w-lg mx-auto">
          <p className="font-extrabold text-sm sm:text-base flex items-center justify-center gap-2">
            <span>🚨</span>
            <span>पैसे कट गए हैं? तुरंत 1930 डायल करें</span>
          </p>
          <p className="text-xs text-ink/80">
            गोल्डन ऑवर: घटना के पहले 2 घंटे में कॉल करने से बैंक खाता सील हो सकता है।
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-muted py-2">
        सचेत (SACHET) • साइबर सुरक्षा एवं नागरिक संरक्षण पहल • छत्तीसगढ़ शासन
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Landing Page */}
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
