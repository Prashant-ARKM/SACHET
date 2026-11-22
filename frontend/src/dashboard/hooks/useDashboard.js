import { useOutletContext } from 'react-router-dom'

// Pages read shared data + filters from DashboardLayout.
export const useDashboard = () => useOutletContext()
