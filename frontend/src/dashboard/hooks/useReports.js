import { useEffect, useState } from 'react'
import { fetchReports } from '../lib/api.js'

// Polls the server every 5 s.
// If one request fails after live data has arrived, keep showing the last live data
// instead of switching to sample data (the free server is sometimes slow).
export function useReports(intervalMs = 5000) {
  const [state, setState] = useState({ reports: [], source: 'loading', updatedAt: null })

  useEffect(() => {
    let alive = true
    const load = async () => {
      const { reports, source } = await fetchReports()
      if (!alive) return
      setState((prev) =>
        source === 'sample' && prev.source === 'live'
          ? prev // keep the last live data; try again on the next poll
          : { reports, source, updatedAt: new Date() },
      )
    }
    load()
    const id = setInterval(load, intervalMs)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [intervalMs])

  return state
}