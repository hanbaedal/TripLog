export type MapSearchInput = {
  cityKo?: string
  spotKo?: string
  cityZh?: string
  nameZh?: string
  addressZh?: string
}

function mapQuery(input: MapSearchInput): string {
  const address = String(input.addressZh || '').trim()
  if (address) return address
  const zh = [input.cityZh, input.nameZh].filter(Boolean).join('')
  if (zh) return zh
  return `${input.cityKo || ''} ${input.spotKo || ''}`.trim()
}

export function mapSearchLinks(input: MapSearchInput) {
  const q = encodeURIComponent(mapQuery(input))
  return {
    baidu: `https://map.baidu.com/search/${q}`,
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
  }
}

export function formatSpotLabel(spot: { name: string; nameZh?: string }): string {
  const ko = String(spot.name || '').trim()
  const zh = String(spot.nameZh || '').trim()
  if (zh && ko) return `${zh} (${ko})`
  return ko || zh
}
