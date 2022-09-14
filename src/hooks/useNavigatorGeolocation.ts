import { useEffect, useMemo, useState } from 'react'

export interface NavigatorGeolocationInfo {
  browserCurrentPositionError?: GeolocationPositionError
  browserCurrentPosition?: GeolocationPosition
  browserLastKnownPosition?: GeolocationPosition
  isPermissionDenied?: boolean
}

export default function useNavigatorGeolocation(): NavigatorGeolocationInfo  {

  const [browserCurrentPosition, setBrowserCurrentPosition] = useState<GeolocationPosition | undefined>(undefined)
  const [browserCurrentPositionError, setBrowserCurrentPositionError] = useState<GeolocationPositionError | undefined>(
    undefined
  )
  const [browserLastKnownPosition, setBrowserLastKnownPosition] = useState<GeolocationPosition | undefined>(undefined)
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean | undefined>(undefined)

  const info: NavigatorGeolocationInfo = useMemo(() => {
    return {
      browserCurrentPositionError,
      browserCurrentPosition,
      browserLastKnownPosition,
      isPermissionDenied
    }
  }, [browserCurrentPositionError, browserCurrentPosition, browserLastKnownPosition, isPermissionDenied])

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBrowserCurrentPositionError(undefined)
          setBrowserCurrentPosition(position)
          setBrowserLastKnownPosition(position)
          setIsPermissionDenied(false)
        },
        (e: GeolocationPositionError) => {
          setBrowserCurrentPositionError(e)
          setBrowserCurrentPosition(undefined)

          const isPermissionDenied = e.code === GeolocationPositionError.PERMISSION_DENIED
          setIsPermissionDenied(isPermissionDenied)

          const msg = (isPermissionDenied ? [
            "User did not allow sharing his location. That's totally fine!",
            'Watch your privacy man! You can input it manually.',
            e.message
          ] : [
            'Could not aquire location: ',
            e.message
          ]).join('\n')

          console.debug(msg)
        }
      )
    }
  }, [])

  return info
}
