import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LaunchPage from './LaunchPage.jsx'
import DashboardLayout from './dashboard/DashboardLayout.jsx'
import Overview from './dashboard/pages/Overview.jsx'
import MapPage from './dashboard/pages/MapPage.jsx'
import TrendsPage from './dashboard/pages/TrendsPage.jsx'
import TypesPage from './dashboard/pages/TypesPage.jsx'
import ActivityPage from './dashboard/pages/ActivityPage.jsx'
import CampaignPage from './dashboard/pages/CampaignPage.jsx'

// Citizen App (U2)
import CitizenLayout from './citizen/CitizenLayout.jsx'
import CitizenHome from './citizen/pages/CitizenHome.jsx'
import CitizenCheck from './citizen/pages/CitizenCheck.jsx'
import CitizenReport from './citizen/pages/CitizenReport.jsx'
import CitizenLearn from './citizen/pages/CitizenLearn.jsx'
import CitizenAlert from './citizen/pages/CitizenAlert.jsx'

// Short link printed in alert QRs: /a#<token> -> /citizen/alert#<token>
function AlertShortLink() {
  const { hash } = useLocation()
  return <Navigate to={{ pathname: '/citizen/alert', hash }} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LaunchPage />} />
      <Route path="/a" element={<AlertShortLink />} />

      {/* Citizen App (U2) */}
      <Route path="/citizen" element={<CitizenLayout />}>
        <Route index element={<CitizenHome />} />
        <Route path="check" element={<CitizenCheck />} />
        <Route path="report" element={<CitizenReport />} />
        <Route path="learn" element={<CitizenLearn />} />
        <Route path="alert" element={<CitizenAlert />} />
      </Route>

      {/* Official Dashboard (U1) */}
      <Route path="/official" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="map" element={<MapPage />} />
        <Route path="trends" element={<TrendsPage />} />
        <Route path="types" element={<TypesPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="campaign" element={<CampaignPage />} />
      </Route>
    </Routes>
  )
}
