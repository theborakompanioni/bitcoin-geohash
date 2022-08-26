// see https://github.com/Blockstream/esplora/blob/master/API.md

const baseUrl = 'https://blockstream.info/api'

export const blockHeight = async (blockHeight: number, { signal }: { signal?: AbortSignal } = {}) => {
  return await fetch(`${baseUrl}/block-height/${blockHeight}`, {
    signal,
  })
}

export const blocksTipHeight = async ({ signal }: { signal?: AbortSignal } = {}) => {
  return await fetch(`${baseUrl}/blocks/tip/height`, {
    signal,
  })
}
