import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, ScaleControl, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import { MinimapControl } from './Minimap'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { ControlPosition, LatLngExpression } from 'leaflet'
import { fetchBlockHashByHeight, geohash, LatLng } from './utils'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

function Minimap({ position }: { position: ControlPosition }) {
  const map = useMap()
  return <MinimapControl parentMap={map} position={position} zoom={1} />
}

function App() {
  const myPosition: LatLngExpression = useMemo(() => [30.375115, -97.687444], [])

  const myPositionMarker = useMemo(
    () => (
      <Marker position={myPosition}>
        <Popup>You</Popup>
      </Marker>
    ),
    [myPosition]
  )

  const [loading, setLoading] = useState(true)
  const [blockHash, setBlockHash] = useState<string | null>(null)
  const [geohashPosition, setGeohashPosition] = useState<LatLng | null>(null)

  useEffect(() => {
    const abortCtrl = new AbortController()
    fetchBlockHashByHeight(0, { signal: abortCtrl.signal })
      .then(async (res) => {
        if (res.ok) {
          setBlockHash(await res.text())
        }
      })
      .finally(() => setLoading(false))

    return () => {
      abortCtrl.abort()
    }
  }, [])

  useEffect(() => {
    if (!blockHash) return
    setGeohashPosition(geohash(blockHash, myPosition))
  }, [blockHash, myPosition])

  const geohashPositionMarker = useMemo(() => {
    if (!geohashPosition) return

    return (
      <Marker position={geohashPosition as LatLngExpression}>
        <Popup>{blockHash}</Popup>
      </Marker>
    )
  }, [blockHash, geohashPosition])

  return (
    <>
      <a href="https://github.com/theborakompanioni/bitcoin-places" rel="noopener noreferrer">
        <img alt="Fork me on GitHub" title="Fork me on GitHub" src="fork_me.png" id="forkme" />
      </a>
      <div className="App">
        <div style={{ width: '100vw', height: `100vh`, position: 'absolute', left: 0, top: 0, zIndex: -1 }}>
          <MapContainer
            style={{ width: '100%', height: '100%' }}
            center={[30.375115, -97.687444]}
            zoom={8}
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <ZoomControl position="bottomleft" />
            <Minimap position="bottomright" />
            <ScaleControl position="topleft" />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={TILE_URL}
            />
            {myPositionMarker}
            {geohashPositionMarker}
          </MapContainer>
        </div>

        <header className="App-container" style={{ backgroundColor: 'rgba(0, 0, 0, 0.33)' }}>
          <h1>Bitcoin Places</h1>
          <div className="mt-1">{blockHash}</div>
          <div className="mt-1">
            <h2>Contribute</h2>
            <p>
              <a href="https://github.com/theborakompanioni/bitcoin-places" rel="noopener noreferrer">
                Fork me on GitHub
              </a>
            </p>
          </div>
        </header>
      </div>
    </>
  )
}

export default App
