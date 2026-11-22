import { useEffect, useRef, useState } from 'react'

// Animates a number from its previous value to `target` (ease-out).
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    const start = performance.now()
    const begin = from.current
    let raf
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = begin + (target - begin) * eased
      from.current = v // so a new target starts from what's on screen
      setValue(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
