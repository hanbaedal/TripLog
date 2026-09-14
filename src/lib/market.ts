export type Market = 'kr' | 'cn'

const STORAGE_KEY = 'triplog.market.v1'

export const MARKET_LABEL: Record<Market, string> = {
  kr: '국내 여행',
  cn: '중국 여행',
}

export const MARKET_SHORT: Record<Market, string> = {
  kr: '국내',
  cn: '중국',
}

export function defaultMarket(): Market {
  return 'cn'
}

export function readMarket(): Market {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === 'kr' || raw === 'cn' ? raw : defaultMarket()
  } catch {
    return defaultMarket()
  }
}

export function writeMarket(market: Market): void {
  localStorage.setItem(STORAGE_KEY, market)
}

export function tripMarket(trip: { market?: Market } | null | undefined): Market {
  return trip?.market === 'kr' ? 'kr' : 'cn'
}

export function sampleMarket(sample: { market?: Market; trip?: { market?: Market } }): Market {
  if (sample.market === 'kr' || sample.market === 'cn') return sample.market
  return tripMarket(sample.trip)
}

export function inferMarketFromId(id?: string): Market | null {
  if (!id) return null
  if (id.startsWith('info-kr-') || id.startsWith('kr-') || id.startsWith('spot-kr-')) return 'kr'
  return null
}

export function travelInfoMarket(item: { market?: Market; id?: string }): Market {
  if (item.market === 'kr' || item.market === 'cn') return item.market
  return inferMarketFromId(item.id) || 'cn'
}

export function galleryPhotoMarket(photo: { market?: Market; id?: string; city?: string }): Market {
  if (photo.market === 'kr' || photo.market === 'cn') return photo.market
  if (inferMarketFromId(photo.id) === 'kr') return 'kr'
  if (photo.city?.startsWith('kr-')) return 'kr'
  return 'cn'
}

export function filterByMarket<T extends { market?: Market; id?: string }>(
  rows: T[],
  market: Market,
  resolve: (row: T) => Market = (row) => (row.market === 'kr' || row.market === 'cn' ? row.market : 'cn'),
): T[] {
  return rows.filter((row) => resolve(row) === market)
}
