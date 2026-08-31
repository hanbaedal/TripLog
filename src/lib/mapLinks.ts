export function mapSearchLinks(city: string, spot: string) {
  const q = encodeURIComponent(`${city} ${spot}`.trim())
  return {
    naver: `https://map.naver.com/v5/search/${q}`,
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
  }
}
