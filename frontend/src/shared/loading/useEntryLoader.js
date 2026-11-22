import { useCallback, useState } from 'react'
import { reducedMotion } from './motion.js'

// True while the scan loader should be on screen (from the moment a section mounts).
export function useEntryLoader() {
  const [entering, setEntering] = useState(() => !reducedMotion())
  const done = useCallback(() => setEntering(false), [])
  return [entering, done]
}
