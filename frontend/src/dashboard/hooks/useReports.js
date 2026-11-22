import { useEffect, useState } from 'react'
import { fetchReports } from '../lib/api.js'

// Polls the server every 5 s (no WebSockets tonight).
export function useReports(intervalMs = 5000) {
  const [state, setState] = useState({ reports: [], source: 'loading', updatedAt: null })

  useEffect(() => {
    let alive = true
    const load = async () => {
      const { reports, source } = await fetchReports()
      if (alive) setState({ reports, source, updatedAt: new Date() })
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
