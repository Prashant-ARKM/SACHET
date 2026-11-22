// Same values as @theme in index.css, for ECharts / Leaflet / SVG (they need plain hex).
export const C = {
  beige: '#F7F1E6',
  card: '#FFFDF8',
  line: '#ECE2CF',
  ink: '#1E2A22',
  muted: '#5E6B61',
  forest: '#1F4D33',
  forest2: '#2A6444',
  leaf: '#3E8E5E',
  mint: '#DDEEE2',
  scam: '#B3261E',
  blush: '#FBE3DF',
  warn: '#9A5B00',
  safe: '#2E7D4F',
  sun: '#F2B33D',
  sunTint: '#FCEFD2',
}

// Shared ECharts bits so every chart matches.
export const axisStyle = {
  axisLine: { lineStyle: { color: C.line } },
  axisLabel: { color: C.muted },
  splitLine: { lineStyle: { color: C.line, type: 'dashed' } },
}
export const tooltipStyle = {
  backgroundColor: C.card,
  borderColor: C.line,
  textStyle: { color: C.ink },
}
// Vertical fade for area charts.
export const fade = (hex, top = 0.35) => ({
  type: 'linear',
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: hex + Math.round(top * 255).toString(16).padStart(2, '0') },
    { offset: 1, color: hex + '00' },
  ],
})
