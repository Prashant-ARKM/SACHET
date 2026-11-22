// Tiny trend line (no chart library). Scales to its box.
export default function Sparkline({ values, color = '#1F4D33', fill = true, className = 'w-24 h-8' }) {
  const n = values.length
  if (n < 2) return null
  const max = Math.max(1, ...values)
  const pts = values.map((v, i) => [(i / (n - 1)) * 100, 30 - (v / max) * 26])
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const id = `spark-${color.replace('#', '')}`

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <polygon points={`0,32 ${line} 100,32`} fill={`url(#${id})`} />}
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r="2.5" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
