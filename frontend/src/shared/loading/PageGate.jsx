import { useEffect, useState } from 'react'
import { SKELETON_MS, CROSSFADE_MS, reducedMotion } from './motion.js'

// Shows `skeleton` first, then crossfades to the page while its tiles rise in one by one.
// hold: keep showing the skeleton (e.g. while the scan loader is on screen).
// Give it key={pathname} so every page change replays it.
export default function PageGate({ hold = false, skeleton, className = '', children }) {
  const [phase, setPhase] = useState(() => (reducedMotion() ? 'content' : 'skeleton'))

  useEffect(() => {
    if (phase === 'skeleton' && !hold) {
      const t = setTimeout(() => setPhase('fade'), SKELETON_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'fade') {
      const t = setTimeout(() => setPhase('content'), CROSSFADE_MS)
      return () => clearTimeout(t)
    }
  }, [phase, hold])

  if (phase === 'skeleton') {
    return (
      <div className={`gate ${className}`} aria-busy="true">
        {skeleton}
      </div>
    )
  }

  return (
    <div className={`gate ${className}`}>
      <div className={`reveal ${className}`}>{children}</div>
      {phase === 'fade' && (
        <div className="gate-skeleton-out" aria-hidden="true">
          {skeleton}
        </div>
      )}
    </div>
  )
}
