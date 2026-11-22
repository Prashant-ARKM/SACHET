import { useState } from 'react'
import { scamLabel } from '../../shared/scamTypes.js'
import { inr, timeAgo } from '../lib/stats.js'

export const CHANNEL_LABEL = { sms: 'SMS', whatsapp: 'WhatsApp', call: 'Phone call', other: 'Other' }

// Latest reports. No victim data and no message text are ever stored.
// Click a row to read the scammer identifiers the citizen reported (phone / UPI / link) and the amount lost.
const DETAIL_LABELS = {
  en: { phone: 'Scammer phone', upi: 'Scammer UPI', url: 'Link', amount: 'Amount lost', none: 'None reported', channel: 'Channel', time: 'Reported', id: 'Report ID' },
  hi: { phone: 'ठग का फ़ोन', upi: 'ठग का UPI', url: 'लिंक', amount: 'गँवाई गई रकम', none: 'कोई नहीं', channel: 'माध्यम', time: 'रिपोर्ट का समय', id: 'रिपोर्ट आईडी' },
  cg: { phone: 'ठग के फोन', upi: 'ठग के UPI', url: 'लिंक', amount: 'गंवाए रकम', none: 'कुछु नइ', channel: 'माध्यम', time: 'रिपोर्ट के बखत', id: 'रिपोर्ट आईडी' },
}

export default function ActivityFeed({ reports, limit = 6, compact = false, lang = 'en', t }) {
  const rows = reports.slice(0, limit)
  const [openId, setOpenId] = useState(null)
  const L = DETAIL_LABELS[lang] || DETAIL_LABELS.en
  const channelNames = {
    sms: t?.channelSms || 'SMS',
    whatsapp: t?.channelWhatsapp || 'WhatsApp',
    call: t?.channelPhoneCall || 'Phone call',
    other: t?.channelOther || 'Other',
  }

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
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 text-left"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${r.amount_lost > 0 ? 'bg-scam' : 'bg-leaf'}`} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink truncate">{scamLabel(r.scam_type, lang)}</div>
                <div className="text-xs text-muted truncate">
                  {r.district}
                  {!compact && ` · ${channelNames[r.channel] ?? r.channel}`} · {timeAgo(r.created_at)}
                </div>
              </div>
              {r.amount_lost > 0 && (
                <span className="text-xs font-semibold text-scam whitespace-nowrap">
                  {inr(r.amount_lost)} {t?.lostLabel || 'lost'}
                </span>
              )}
              <span className="text-muted text-xs">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <dl className="mt-2 ml-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs bg-beige/60 border border-line rounded-xl p-3">
                <dt className="text-muted">{L.phone}</dt>
                <dd className="text-ink font-mono break-all">{sc.phone || '–'}</dd>
                <dt className="text-muted">{L.upi}</dt>
                <dd className="text-ink font-mono break-all">{sc.upi_id || '–'}</dd>
                <dt className="text-muted">{L.url}</dt>
                <dd className="text-ink font-mono break-all">{sc.url || '–'}</dd>
                <dt className="text-muted">{L.amount}</dt>
                <dd className="text-ink">{r.amount_lost > 0 ? inr(r.amount_lost) : L.none}</dd>
                <dt className="text-muted">{L.channel}</dt>
                <dd className="text-ink">{channelNames[r.channel] ?? r.channel}</dd>
                <dt className="text-muted">{L.time}</dt>
                <dd className="text-ink">{new Date(r.created_at).toLocaleString()}</dd>
                <dt className="text-muted">{L.id}</dt>
                <dd className="text-ink font-mono break-all">{r.id}</dd>
              </dl>
            )}
          </li>
        )
      })}
      {!rows.length && (
        <li className="py-2 text-sm text-muted">
          {t?.noReportsMatch || 'No reports match these filters'}
        </li>
      )}
    </ul>
  )
}
