import React from 'react'
import { MapContainer, Marker, Popup, ScaleControl, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import { MinimapControl } from './Minimap'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { ControlPosition } from 'leaflet'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

function Minimap({ position }: { position: ControlPosition}) {
  const map = useMap()
  return <MinimapControl parentMap={map} position={position} zoom={1} />
}

function App() {
  const marker = (
    <Marker position={[30.375115, -97.687444]}>
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker>
  )

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
            <Minimap position="bottomright"/>
            <ScaleControl position="topleft" />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={TILE_URL}
            />
            {marker}
          </MapContainer>
        </div>

        <header className="App-container" style={{ backgroundColor: 'rgba(0, 0, 0, 0.33)' }}>
          <h1>Bitcoin Places</h1>
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
