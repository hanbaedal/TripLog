import type { Market } from '../types'

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

export function mapSearchLinks(input: MapSearchInput, market: Market = 'cn') {
  const q = encodeURIComponent(mapQuery(input))
  if (market === 'kr') {
    return {
      naver: `https://map.naver.com/v5/search/${q}`,
      kakao: `https://map.kakao.com/?q=${q}`,
      google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    }
  }
  return {
    baidu: `https://map.baidu.com/search/${q}`,
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
  }
}

export function formatSpotLabel(spot: { name: string; nameZh?: string }, market: Market = 'cn'): string {
  const ko = String(spot.name || '').trim()
  const zh = String(spot.nameZh || '').trim()
  if (market === 'cn' && zh && ko) return `${zh} (${ko})`
  return ko || zh
}
