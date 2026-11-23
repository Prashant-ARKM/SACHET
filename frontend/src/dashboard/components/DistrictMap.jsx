import { geoJSON } from 'leaflet'
import { MapContainer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet'
import boundary from '../../shared/chhattisgarh-boundary.json'
import { DISTRICTS } from '../../shared/districts.js'
import { countBy } from '../lib/stats.js'
import { C } from '../lib/theme.js'

const stateBounds = geoJSON(boundary).getBounds()
const boundaryStyle = {
  color: C.forest,
  weight: 2,
  fillColor: C.mint,
  fillOpacity: 1,
}
const boundaryAttribution =
  '<a href="https://www.geoboundaries.org/api/current/gbOpen/IND/ADM1/">geoBoundaries</a> / ' +
  'DataMeet India and Election Commission of India ' +
  '(<a href="https://creativecommons.org/licenses/by/2.5/in/">CC BY 2.5 IN</a>)'

// Circle size + strength = report count. Click a district to filter everything.
// Fills its parent: give the parent a height.
export default function DistrictMap({ reports, selected, onSelect, t }) {
  const counts = countBy(reports, 'district')
  const max = Math.max(1, ...Object.values(counts))

  return (
    <MapContainer
      bounds={stateBounds}
      boundsOptions={{ padding: [28, 28] }}
      maxBounds={stateBounds.pad(0.2)}
      maxBoundsViscosity={1}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: 12, background: C.beige }}
    >
      <GeoJSON
        data={boundary}
        style={boundaryStyle}
        interactive={false}
        attribution={boundaryAttribution}
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
