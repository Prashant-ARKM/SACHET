import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { DISTRICTS } from '../../shared/districts.js'
import { countBy } from '../lib/stats.js'
import { C } from '../lib/theme.js'

// Circle size + strength = report count. Click a district to filter everything.
// Fills its parent: give the parent a height.
export default function DistrictMap({ reports, selected, onSelect, zoom = 7, t }) {
  const counts = countBy(reports, 'district')
  const max = Math.max(1, ...Object.values(counts))

  return (
    <MapContainer
      center={[21.3, 82.0]}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: 12, background: C.beige }}
    >
      {/* CARTO Voyager: soft but colourful basemap */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {DISTRICTS.map((d) => {
        const n = counts[d.name] ?? 0
        const active = selected === d.name
        return (
          <CircleMarker
            key={d.id}
            center={[d.lat, d.lng]}
            radius={5 + Math.sqrt(n) * 3}
            pathOptions={{
              color: active ? C.forest : C.scam,
              weight: active ? 3 : 1,
              fillColor: C.scam,
              fillOpacity: n ? 0.15 + 0.55 * (n / max) : 0.05,
            }}
            eventHandlers={{ click: () => onSelect(active ? '' : d.name) }}
          >
            <Tooltip>
              <strong>{d.name}</strong>: {n} {t?.alertReports || 'reports'}
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
