
const baseUrl = 'https://blockstream.info/api'

export const blockHeight = async (blockHeight: number, { signal }: { signal?: AbortSignal } = {}) => {
  return await fetch(`${baseUrl}/block-height/${blockHeight}`, {
    signal,
  })
}
