export type Base10 = string
export type Base16 = string
export type LatLng = [number, number]

const bigIntPow = (() => {
  const ZERO = BigInt(0)
  const TWO = BigInt(2)

  return function power(x: bigint, y: bigint): bigint {
    if (y === ZERO) return BigInt(1)
    const p2 = power(x, y / TWO)
    if (y % TWO === ZERO) return p2 * p2
    return x * p2 * p2
  }
})()

export const convertBaseBigInt = (() => {
  const RANGE = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('')

  return (value: string, from_base: number, to_base: number): string => {
    if (from_base < 2 || from_base > RANGE.length)
      throw new RangeError(`convertBase() from_base argument must be between 2 and ${RANGE.length}`)
    if (to_base < 2 || to_base > RANGE.length)
      throw new RangeError(`convertBase() to_base argument must be between 2 and ${RANGE.length}`)

    const from_range = RANGE.slice(0, from_base)
    const to_range = RANGE.slice(0, to_base)

    const from_base_big = BigInt(from_base)
    const to_base_big = BigInt(to_base)

    let dec_value = value
      .split('')
      .reverse()
      .reduce((carry, digit, index) => {
        const fromIndex = from_range.indexOf(digit)
        if (fromIndex === -1) throw new Error(`Invalid digit ${digit} for base ${from_base}.`)

        return carry + BigInt(fromIndex) * bigIntPow(from_base_big, BigInt(index))
      }, BigInt(0))

    let new_value = ''
    while (dec_value > 0) {
      new_value = to_range[Number(dec_value % to_base_big)] + new_value
      dec_value = (dec_value - (dec_value % to_base_big)) / to_base_big
    }
    return new_value || '0'
  }
})()

export const base16ToBase10 = (base16: Base16): Base10 => convertBaseBigInt(base16, 16, 10)

const intPart = (val: number) => {
  return val > 0 ? Math.floor(val) : Math.ceil(val)
}

export const geohash = (blockHash: Base16, position: LatLng) => {
  const hashBase = blockHash.substring(32, 64)
  const latHashFractPart = hashBase.substring(0, 16)
  const lngHashFractPart = hashBase.substring(16, 32)

  const latIntPart = intPart(position[0])
  const latFractPart = base16ToBase10(latHashFractPart).substring(0, 6)
  const lat = +`${latIntPart}.${latFractPart}`

  const lngIntPart = intPart(position[1])
  const lngFractPart = base16ToBase10(lngHashFractPart).substring(0, 6)

  const lng = +`${lngIntPart}.${lngFractPart}`
  return [lat, lng]
}
