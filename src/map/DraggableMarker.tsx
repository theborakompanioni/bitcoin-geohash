import { PropsWithChildren, useMemo, useRef } from 'react'
import { Marker } from 'react-leaflet'
import { LatLngExpression, Marker as LeafletMarker } from 'leaflet'

export interface DraggableMarkerProps {
  position: LatLngExpression
  onDragEnd: (marker: LeafletMarker) => void
}
export default function DraggableMarker({ position, onDragEnd, children }: PropsWithChildren<DraggableMarkerProps>) {
  const markerRef = useRef<LeafletMarker>(null)
  const eventHandlers = useMemo(
    () => ({
      dragend: () => {
        if (markerRef.current) {
          onDragEnd(markerRef.current)
        }
      },
    }),
    [onDragEnd]
  )

  return (
    <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef}>
      {children}
    </Marker>
  )
}
