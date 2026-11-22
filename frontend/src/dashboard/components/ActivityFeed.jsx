import { useState } from 'react'
import { scamLabel } from '../../shared/scamTypes.js'
import { inr, timeAgo } from '../lib/stats.js'

export const CHANNEL_LABEL = { sms: 'SMS', whatsapp: 'WhatsApp', call: 'Phone call', other: 'Other' }

// Latest reports. No victim data and no message text are ever stored.
// Click a row to see the scammer identifiers the citizen reported (phone / UPI / link) and the amount lost.
export default function ActivityFeed({ reports, limit = 6, compact = false }) {
  const rows = reports.slice(0, limit)
  const [openId, setOpenId] = useState(null)

  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => {
        const isOpen = openId === r.id
        const sc = r.scammer || {}
        return (
          <li key={r.id} className="py-2.5 text-sm">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : r.id)}
              className="w-full flex items-center justify-between gap-3 text-left"
              aria-expanded={isOpen}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${r.amount_lost > 0 ? 'bg-scam' : 'bg-leaf'}`} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink truncate">{scamLabel(r.scam_type)}</div>
                <div className="text-xs text-muted truncate">
                  {r.district}
                  {!compact && ` · ${CHANNEL_LABEL[r.channel] ?? r.channel}`} · {timeAgo(r.created_at)}
                </div>
              </div>
              {r.amount_lost > 0 && (
                <span className="text-xs font-semibold text-scam whitespace-nowrap">{inr(r.amount_lost)} lost</span>
              )}
              <span className="text-muted text-xs">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <dl className="mt-2 ml-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs bg-beige/60 border border-line rounded-xl p-3">
                <dt className="text-muted">Scammer phone</dt>
                <dd className="text-ink font-mono break-all">{sc.phone || '–'}</dd>
                <dt className="text-muted">Scammer UPI</dt>
                <dd className="text-ink font-mono break-all">{sc.upi_id || '–'}</dd>
                <dt className="text-muted">Link</dt>
                <dd className="text-ink font-mono break-all">{sc.url || '–'}</dd>
                <dt className="text-muted">Amount lost</dt>
                <dd className="text-ink">{r.amount_lost > 0 ? inr(r.amount_lost) : 'None reported'}</dd>
                <dt className="text-muted">Channel</dt>
                <dd className="text-ink">{CHANNEL_LABEL[r.channel] ?? r.channel}</dd>
                <dt className="text-muted">Reported</dt>
                <dd className="text-ink">{new Date(r.created_at).toLocaleString()}</dd>
                <dt className="text-muted">Report ID</dt>
                <dd className="text-ink font-mono break-all">{r.id}</dd>
              </dl>
            )}
          </li>
        )
      })}
      {!rows.length && <li className="py-2 text-sm text-muted">No reports match these filters</li>}
    </ul>
  )
}
