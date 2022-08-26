import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, Rectangle, ScaleControl, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import { MinimapControl } from './Minimap'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { ControlPosition, LatLngBoundsExpression } from 'leaflet'
import { fetchBlockHashByHeight, fetchBlockTipHeight, geohash, LatLng, throwError } from './utils'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

const AUSTIN: LatLng = [30.375115, -97.687444]
const DEFAULT_LOCATION = AUSTIN
const DEFAULT_CENTER = AUSTIN
const DEFAULT_ZOOM = 9 // should cover every block in your view

const BLOCKS_PER_DAY = 6 * 24
const BLOCKS_PER_WEEK = BLOCKS_PER_DAY * 7

const BLOCKHEIGHT_TO_HASH_MAP: { [key: number]: string } = {
  0: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
}

function Minimap({ position }: { position: ControlPosition }) {
  const map = useMap()
  return <MinimapControl parentMap={map} position={position} zoom={1} />
}

function PanToMapCenter({ center }: { center?: LatLng }) {
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

function App() {
  const [browserCurrentPosition, setBrowserCurrentPosition] = useState<GeolocationPosition | undefined>(undefined)
  const [browserCurrentPositionError, setBrowserCurrentPositionError] = useState<GeolocationPositionError | undefined>(
    undefined
  )
  const [myPosition, setMyPosition] = useState<LatLng | undefined>(undefined)

  const rectangleBounds = useMemo(() => {
    if (!myPosition) return

    return [
      [Math.floor(myPosition[0]), Math.floor(myPosition[1])],
      [Math.floor(myPosition[0]) + 1, Math.floor(myPosition[1]) + 1],
    ] as LatLngBoundsExpression
  }, [myPosition])

  const rectangle = useMemo(() => {
    if (!rectangleBounds) return

    return <Rectangle bounds={rectangleBounds} pathOptions={{ color: 'black' }} />
  }, [rectangleBounds])

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.debug(position)
          setBrowserCurrentPosition(position)
          setBrowserCurrentPositionError(undefined)
        },
        (e) => {
          setBrowserCurrentPosition(undefined)
          setBrowserCurrentPositionError(e)

          const msg = [
            "User did not allow sharing his location. That's totally fine!",
            'Watch your privacy man! You can input it manually.',
          ].join('\n')
          console.debug(msg)
        }
      )
    }
  }, [])

  useEffect(() => {
    console.log('aaaa')
    if (browserCurrentPosition) {
      const latLng: LatLng = [browserCurrentPosition.coords.latitude, browserCurrentPosition.coords.longitude]
      setMyPosition(latLng)
    } else if (browserCurrentPositionError) {
      setMyPosition(DEFAULT_LOCATION)
    }
  }, [browserCurrentPosition, browserCurrentPositionError])

  const myPositionMarker = useMemo(() => {
    if (!myPosition) return

    return (
      <Marker position={myPosition}>
        <Popup>
          You ({myPosition[0]}, {myPosition[1]})
        </Popup>
      </Marker>
    )
  }, [myPosition])

  const [loading, setLoading] = useState(true)
  const [blockTipHeight, setBlockTipHeight] = useState<number | null>(null)
  const [blockHeight, setBlockHeight] = useState(0)
  const [blockHash, setBlockHash] = useState<string | null>(null)

  const geohashPosition = useMemo(() => {
    if (!blockHash) return
    if (!myPosition) return
    return geohash(blockHash, myPosition)
  }, [blockHash, myPosition])

  const geohashPositionMarker = useMemo(() => {
    if (!geohashPosition) return

    return (
      <Marker position={geohashPosition}>
        <Popup autoClose={false}>{blockHash}</Popup>
      </Marker>
    )
  }, [blockHash, geohashPosition])

  const blockHeightOfTheDay = useMemo(() => {
    if (blockTipHeight === null) return null
    return blockTipHeight - (blockTipHeight % BLOCKS_PER_DAY) - BLOCKS_PER_DAY
  }, [blockTipHeight])

  const blockHeightOfTheWeek = useMemo(() => {
    if (blockTipHeight === null) return null
    return blockTipHeight - (blockTipHeight % BLOCKS_PER_WEEK) - BLOCKS_PER_WEEK
  }, [blockTipHeight])

  const onClickCurrent = useCallback(() => {
    if (blockTipHeight === null) return
    setBlockHeight(blockTipHeight)
  }, [blockTipHeight])

  const onClickToday = useCallback(() => {
    if (blockHeightOfTheDay === null) return
    setBlockHeight(blockHeightOfTheDay)
  }, [blockHeightOfTheDay])

  const onClickWeek = useCallback(() => {
    if (blockHeightOfTheWeek === null) return
    setBlockHeight(blockHeightOfTheWeek)
  }, [blockHeightOfTheWeek])

  useEffect(() => {
    const abortCtrl = new AbortController()

    setLoading(true)
    fetchBlockTipHeight({ signal: abortCtrl.signal })
      .then((val) => new Promise<Response>((resolve) => setTimeout(() => resolve(val), 1_000)))
      .then((res) => (res.ok ? res.text() : throwError('')))
      .then((data) => {
        if (abortCtrl.signal.aborted) return
        setBlockTipHeight(parseInt(data, 10))
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false))

    return () => {
      abortCtrl.abort()
    }
  }, [])

  useEffect(() => {
    if (BLOCKHEIGHT_TO_HASH_MAP[blockHeight]) {
      setBlockHash(BLOCKHEIGHT_TO_HASH_MAP[blockHeight])
      return
    }

    const abortCtrl = new AbortController()
    const height = blockHeight
    fetchBlockHashByHeight(height, { signal: abortCtrl.signal })
      .then((val) => new Promise<Response>((resolve) => setTimeout(() => resolve(val), 1_000)))
      .then((res) => (res.ok ? res.text() : throwError('')))
      .then((hash) => {
        if (abortCtrl.signal.aborted) return
        BLOCKHEIGHT_TO_HASH_MAP[height] = hash
        setBlockHash(hash)
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false))

    return () => {
      abortCtrl.abort()
    }
  }, [blockHeight])

  return (
    <>
      <a href="https://github.com/theborakompanioni/bitcoin-places" rel="noopener noreferrer">
        <img alt="Fork me on GitHub" title="Fork me on GitHub" src="fork_me.png" id="forkme" />
      </a>
      <div className="App">
        <header className="App-container" style={{ backgroundColor: 'rgba(0, 0, 0, 0.33)' }}>
          <h1>
            Bitcoin Places
            <div className="mt-1 text-small">Most recent block height: {blockTipHeight}</div>
          </h1>
          <div>
            <ul className="m-0 p-0 unstyled vertical">
              <li>
                <button onClick={onClickCurrent}>Current {blockTipHeight}</button>
              </li>
              <li>
                <button onClick={onClickToday}>Today {blockHeightOfTheDay}</button>
              </li>
              <li>
                <button onClick={onClickWeek}>Week {blockHeightOfTheWeek}</button>
              </li>
              <li>
                <button onClick={() => setBlockHeight(0)}>Genesis 0</button>
              </li>
            </ul>
          </div>
          <div className="mt-1">{blockHash}</div>
          <div className="mt-1 d-none">Bounds: {JSON.stringify(rectangleBounds, null, 2)}</div>
        </header>

        <div style={{ width: '100vw', height: `100vh`, position: 'absolute', left: 0, top: 0, zIndex: -1 }}>
          <MapContainer
            style={{ width: '100%', height: '100%' }}
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
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
            {rectangle}
            <PanToMapCenter center={geohashPosition} />
          </MapContainer>
        </div>
      </div>
    </>
  )
}

export default App
