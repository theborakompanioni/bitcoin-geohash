import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer, Rectangle, TileLayer, useMap, useMapEvent } from 'react-leaflet'
import { LeafletMouseEvent, Map, ControlPosition } from 'leaflet'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

const POSITION_CLASSES: { [key in ControlPosition]: string} = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
}

const BOUNDS_STYLE = { weight: 1 }

function MinimapBounds({ parentMap, zoom }: { parentMap: Map; zoom: number }) {
  const minimap = useMap()

  const onClick = useCallback(
    (e: LeafletMouseEvent) => {
      parentMap.setView(e.latlng, parentMap.getZoom())
    },
    [parentMap]
  )
  useMapEvent('click', onClick)

  const [bounds, setBounds] = useState(parentMap.getBounds())
  const onChange = useCallback(() => {
    setBounds(parentMap.getBounds())
    minimap.setView(parentMap.getCenter(), zoom)
  }, [minimap, parentMap, zoom])

  const handlers = useMemo(() => ({ move: onChange, zoom: onChange }), [onChange])

  useEffect(() => {
    parentMap.on(handlers)
    return () => {
      parentMap.off(handlers)
    }
  }, [parentMap, handlers])

  return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />
}

export function MinimapControl({
  parentMap,
  position,
  zoom,
}: {
  parentMap: Map
  position: ControlPosition
  zoom?: number
}) {
  const mapZoom = useMemo(() => zoom || 0, [zoom])
  const minimap = useMemo(
    () => (
      <MapContainer
        style={{ height: 160, width: 160 }}
        center={parentMap.getCenter()}
        zoom={mapZoom}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url={TILE_URL} />
        <MinimapBounds parentMap={parentMap} zoom={mapZoom} />
      </MapContainer>
    ),
    [parentMap, mapZoom]
  )

  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright
  return (
    <div className={positionClass}>
      <div className="leaflet-control leaflet-bar">{minimap}</div>
    </div>
  )
}
