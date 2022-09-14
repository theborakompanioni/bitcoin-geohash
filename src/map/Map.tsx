import React, { PropsWithChildren, useEffect } from 'react'
import {
  MapContainer,
  ScaleControl,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import { LatLng } from './../utils'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

const AUSTIN: LatLng = [30.375115, -97.687444]
const DEFAULT_CENTER = AUSTIN
const DEFAULT_ZOOM = 9 // should cover every block in your view

export function PanToMapCenter({ center }: { center?: LatLng }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return

    map.setView(center, map.getZoom(), {
      animate: true,
      duration: 1,
    })
  }, [map, center])

  return <></>
}

export function MapOnClick({ onClick }: { onClick: (e: LeafletMouseEvent) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e)
    },
  })

  return <></>
}

export default function Map(props: PropsWithChildren<any>) {
  return (<MapContainer
            style={{ width: '100%', height: '100%' }}
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <ZoomControl position="bottomleft" />
            <ScaleControl position="topleft" />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={TILE_URL}
            />
            {props.children}
          </MapContainer>
  )
}
