import React, { useMemo } from 'react'
import { Marker, Popup, Rectangle } from 'react-leaflet'
import Map, { PanToMapCenter, MapOnClick } from './map/Map'
import Minimap from './map/Minimap'
import DraggableMarker from './map/DraggableMarker'

import { LatLng } from './utils'

interface MainMapProps {
  blockHash: string | null
  blockPosition: LatLng | undefined
  referencePosition: LatLng | undefined
  onReferencePositionUpdate: (pos: LatLng | undefined) => void
}

export default function MainMap({
  blockHash,
  blockPosition,
  referencePosition,
  onReferencePositionUpdate,
}: MainMapProps) {
  const referencePositionMarker = useMemo(() => {
    if (!referencePosition) return

    return (
      <DraggableMarker
        position={referencePosition}
        onDragEnd={(marker) => {
          const latLng = marker.getLatLng()
          onReferencePositionUpdate([latLng.lat, latLng.lng])
        }}
      >
        <Popup>
          You ({referencePosition[0]}, {referencePosition[1]})
        </Popup>
      </DraggableMarker>
    )
  }, [referencePosition, onReferencePositionUpdate])

  const rectangleOptions = useMemo(() => {
    if (!referencePosition) return []

    const x = Math.floor(referencePosition[0])
    const y = Math.floor(referencePosition[1])

    const rects = []
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const isActive = i === 0 && j === 0
        const pathOptions = {
          color: isActive ? 'green' : 'black',
          opacity: isActive ? 1 : 0.1,
          fillOpacity: 0.1,
        }
        rects.push({
          bounds: [[x - i, y - j] as LatLng, [x - i + 1, y - j + 1] as LatLng],
          pathOptions,
        })
      }
    }
    return rects
  }, [referencePosition])

  const blockPositionMarker = useMemo(() => {
    if (!blockPosition) return

    return (
      <Marker position={blockPosition}>
        <Popup>
          {blockHash} ({blockPosition[0]}, {blockPosition[1]})
        </Popup>
      </Marker>
    )
  }, [blockHash, blockPosition])

  return (
    <Map>
      <>
        <Minimap position="bottomright" />
        {blockPositionMarker}
        {referencePositionMarker}

        <PanToMapCenter center={blockPosition} />
        <MapOnClick
          onClick={(e) => {
            const latLng = e.latlng
            onReferencePositionUpdate([latLng.lat, latLng.lng])
          }}
        />
        {rectangleOptions.map((options, index) => {
          return <Rectangle key={index} bounds={options.bounds} pathOptions={options.pathOptions} />
        })}
      </>
    </Map>
  )
}
