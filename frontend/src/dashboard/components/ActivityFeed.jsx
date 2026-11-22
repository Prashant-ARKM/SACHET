import { scamLabel } from '../../shared/scamTypes.js'
import { inr, timeAgo } from '../lib/stats.js'

export const CHANNEL_LABEL = { sms: 'SMS', whatsapp: 'WhatsApp', call: 'Phone call', other: 'Other' }

// Latest reports, anonymised: no scammer IDs, no victim data, no message text.
export default function ActivityFeed({ reports, limit = 6, compact = false }) {
  const rows = reports.slice(0, limit)

  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => (
        <li key={r.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
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
        </li>
      ))}
      {!rows.length && <li className="py-2 text-sm text-muted">No reports match these filters</li>}
    </ul>
  )
}
