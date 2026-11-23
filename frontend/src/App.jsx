import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LaunchPage from './LaunchPage.jsx'

// Official dashboard: loaded only when someone opens /official, and never cached offline,
// so citizens' phones don't download or store it.
const DashboardLayout = lazy(() => import('./dashboard/DashboardLayout.jsx'))
const Overview = lazy(() => import('./dashboard/pages/Overview.jsx'))
const MapPage = lazy(() => import('./dashboard/pages/MapPage.jsx'))
const TrendsPage = lazy(() => import('./dashboard/pages/TrendsPage.jsx'))
const TypesPage = lazy(() => import('./dashboard/pages/TypesPage.jsx'))
const ActivityPage = lazy(() => import('./dashboard/pages/ActivityPage.jsx'))

// Citizen App (U2)
import CitizenLayout from './citizen/CitizenLayout.jsx'
import CitizenHome from './citizen/pages/CitizenHome.jsx'
import CitizenCheck from './citizen/pages/CitizenCheck.jsx'
import CitizenReport from './citizen/pages/CitizenReport.jsx'
import CitizenLearn from './citizen/pages/CitizenLearn.jsx'

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
      <Route
        path="/official"
        element={
          <Suspense fallback={<div className="min-h-screen bg-beige grid place-items-center text-sm text-muted">Loading…</div>}>
            <DashboardLayout />
          </Suspense>
        }
      >
        <Route index element={<Overview />} />
        <Route path="map" element={<MapPage />} />
        <Route path="trends" element={<TrendsPage />} />
        <Route path="types" element={<TypesPage />} />
        <Route path="activity" element={<ActivityPage />} />
      </Route>
    </Routes>
  )
}
