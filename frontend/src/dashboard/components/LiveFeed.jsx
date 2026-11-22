import { scamLabel } from '../data/scamTypes.js'
import { inr } from '../lib/stats.js'

// Latest reports. Contract has no victim data and no message text, only scammer identifiers.
export default function LiveFeed({ reports, limit = 12 }) {
  const rows = reports.slice(0, limit)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-gray-500">
          <tr>
            <th className="py-1 pr-4">Time</th>
            <th className="py-1 pr-4">District</th>
            <th className="py-1 pr-4">Type</th>
            <th className="py-1 pr-4">Channel</th>
            <th className="py-1 pr-4">Scammer ID</th>
            <th className="py-1 pr-4 text-right">Lost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-gray-100">
              <td className="py-1 pr-4 whitespace-nowrap">
                {new Date(r.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
              </td>
              <td className="py-1 pr-4">{r.district}</td>
              <td className="py-1 pr-4">{scamLabel(r.scam_type)}</td>
              <td className="py-1 pr-4">{r.channel}</td>
              <td className="py-1 pr-4 font-mono text-xs">
                {r.scammer?.phone || r.scammer?.upi_id || r.scammer?.url || '–'}
              </td>
              <td className="py-1 pr-4 text-right">{r.amount_lost ? inr(r.amount_lost) : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="text-sm text-gray-500 py-2">No reports match these filters</p>}
    </div>
  )
}
