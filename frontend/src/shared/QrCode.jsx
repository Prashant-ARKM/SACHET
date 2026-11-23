import { useMemo } from 'react'
import qrcode from './vendor/qrcode.mjs'

// QR as crisp SVG. Uses the vendored MIT "qrcode-generator" by Kazuhiko Arase (shared/vendor/qrcode.mjs).
// level 'M' survives some print damage; the 4-module quiet zone is part of the image.
export function qrMatrix(text, level = 'M') {
  const qr = qrcode(0, level)
  qr.addData(text)
  qr.make()
  const n = qr.getModuleCount()
  const rows = []
  for (let r = 0; r < n; r++) {
    const row = []
    for (let c = 0; c < n; c++) row.push(qr.isDark(r, c))
    rows.push(row)
  }
  return rows
}

const QUIET = 4

export default function QrCode({ text, size = 200, color = '#1E2A22', background = '#FFFFFF', className = '', title }) {
  const { path, total } = useMemo(() => {
    const m = qrMatrix(text)
    let d = ''
    m.forEach((row, r) =>
      row.forEach((dark, c) => {
        if (dark) d += `M${c + QUIET} ${r + QUIET}h1v1h-1z`
      }),
    )
    return { path: d, total: m.length + QUIET * 2 }
  }, [text])

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={title || 'QR code'}
    >
      <rect width={total} height={total} fill={background} />
      <path d={path} fill={color} />
    </svg>
  )
}

// PNG download (for WhatsApp groups, notice boards, other printouts).
export function downloadQrPng(text, filename = 'sachet-alert-qr.png', px = 1024, caption = '') {
  const m = qrMatrix(text)
  const total = m.length + QUIET * 2
  const cell = Math.floor(px / total)
  const side = cell * total
  const captionH = caption ? Math.round(side * 0.09) : 0
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side + captionH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1E2A22'
  m.forEach((row, r) => row.forEach((dark, c) => dark && ctx.fillRect((c + QUIET) * cell, (r + QUIET) * cell, cell, cell)))
  if (caption) {
    ctx.font = `600 ${Math.round(captionH * 0.45)}px "Plus Jakarta Sans", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(caption, side / 2, side + captionH / 2 - cell)
  }
  canvas.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }, 'image/png')
}
