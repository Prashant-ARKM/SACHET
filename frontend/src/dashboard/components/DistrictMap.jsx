import { useState } from 'react'
import { divIcon, geoJSON } from 'leaflet'
import { MapContainer, GeoJSON, CircleMarker, Marker, Tooltip, useMapEvent } from 'react-leaflet'
import boundary from '../../shared/chhattisgarh-boundary.json'
import districts from '../../shared/chhattisgarh-districts.json'
import { DISTRICTS } from '../../shared/districts.js'
import { countBy } from '../lib/stats.js'
import { C } from '../lib/theme.js'

const stateBounds = geoJSON(boundary).getBounds()
const districtColors = ['#F7DECC', '#E0ECCD', '#E7DDF3', '#FCEDBB']
const boundaryAttribution =
  'Boundaries: LGD 2024 via <a href="https://bharatlas.com/view/lgd_districts">bharatlas</a> ' +
  '(<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>), simplified'

function districtStyle({ properties }) {
  return {
    color: '#64695B',
    weight: 1,
    fillColor: districtColors[properties.color],
    fillOpacity: 1,
  }
}

function labelIcon(lines) {
  const text = document.createElement('span')
  text.className = 'block w-max -translate-x-1/2 -translate-y-1/2 whitespace-pre text-center text-[9px] leading-[11px] font-bold text-ink'
  text.textContent = lines.join('\n')
  return divIcon({ html: text, className: 'pointer-events-none', iconSize: [0, 0] })
}

function DistrictLabels() {
  const [zoom, setZoom] = useState(null)
  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [overviewZoom] = useState(() => map.getZoom())
  const visibleZoom = zoom ?? overviewZoom

  // Keep the full-state view free of labels until one full zoom step in.
  if (visibleZoom < overviewZoom + 1) return null

  return districts.features
    .map(({ properties }) => properties)
    .filter(({ labelMinZoom }) => visibleZoom >= labelMinZoom)
    .map(({ name, label, labelPosition }) => (
      <Marker
        key={name}
        position={labelPosition}
        icon={labelIcon(label)}
        interactive={false}
        keyboard={false}
      />
    ))
}

// Circle size + strength = report count. Click a district to filter everything.
// Fills its parent: give the parent a height.
export default function DistrictMap({ reports, selected, onSelect, t }) {
  const counts = countBy(reports, 'district')
  const max = Math.max(1, ...Object.values(counts))

  return (
    <MapContainer
      bounds={stateBounds}
      boundsOptions={{ padding: [18, 18] }}
      zoomSnap={0.25}
      maxBounds={stateBounds.pad(0.2)}
      maxBoundsViscosity={1}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: 12, background: C.card }}
    >
      <GeoJSON data={districts} style={districtStyle} interactive={false} />
      <GeoJSON
        data={boundary}
        style={{ color: C.forest, weight: 3, fill: false }}
        interactive={false}
        attribution={boundaryAttribution}
      />
      <DistrictLabels />
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
