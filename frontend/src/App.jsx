import { Routes, Route, Link } from 'react-router-dom'
import DashboardLayout from './dashboard/DashboardLayout.jsx'
import Overview from './dashboard/pages/Overview.jsx'
import MapPage from './dashboard/pages/MapPage.jsx'
import TrendsPage from './dashboard/pages/TrendsPage.jsx'
import TypesPage from './dashboard/pages/TypesPage.jsx'
import ActivityPage from './dashboard/pages/ActivityPage.jsx'

// TEMP launch page: U2 replaces this with the real launch screen.
function TempLaunch() {
  return (
    <div className="min-h-screen grid place-items-center gap-4 p-8">
      <div className="flex gap-4">
        <Link to="/citizen" className="px-4 py-2 rounded-lg bg-forest text-card">I'm a citizen</Link>
        <Link to="/official" className="px-4 py-2 rounded-lg bg-forest text-card">I'm an official</Link>
      </div>
      <p className="text-sm text-scam font-medium">Lost money? Call 1930</p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TempLaunch />} />

      {/* Official dashboard (U1) */}
      <Route path="/official" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="map" element={<MapPage />} />
        <Route path="trends" element={<TrendsPage />} />
        <Route path="types" element={<TypesPage />} />
        <Route path="activity" element={<ActivityPage />} />
      </Route>

      {/* Citizen app (U2): <Route path="/citizen/*" element={<CitizenApp />} /> */}
    </Routes>
  )
}
