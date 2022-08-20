import * as sut from './utils'

describe('utils.ts', () => {

  describe('geohash', () => {
    const myLatLng: sut.LatLng = [30.375115,-97.687444]

    test('genesis block', () => {
      const block0: sut.Base16 = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'

      const geohashLatLng = sut.geohash(block0, myLatLng)
      expect(geohashLatLng).toEqual([30.576218,-97.826521])
    })

    test('block 750000', () => {
      const block750000: sut.Base16 = '0000000000000000000592a974b1b9f087cb77628bb4a097d5c2c11b3476a58e'

      const geohashLatLng = sut.geohash(block750000, myLatLng)
      expect(geohashLatLng).toEqual([30.978504,-97.15403])
    })
  })

  test('base16ToBase10', () => {
    expect(sut.base16ToBase10('c')).toBe('12')
    expect(sut.base16ToBase10('d')).toBe('13')
    expect(sut.base16ToBase10('00000000')).toBe('0')
    expect(sut.base16ToBase10('00000001')).toBe('1')
    expect(sut.base16ToBase10('deadbeef')).toBe('3735928559')
    expect(sut.base16ToBase10('0123456789abcdef')).toBe('81985529216486895')
  })
})
