import { writeFileSync } from 'node:fs'
import { TRAVEL_SPOT_CATALOG } from '../src/data/travelSpotCatalog.js'
import { CITY_REGION_ZH, SPOT_LOCALE } from './spot-locale-data.mjs'

const rows = TRAVEL_SPOT_CATALOG.map((spot) => {
  const locale = SPOT_LOCALE[spot.id] || {}
  const region = CITY_REGION_ZH[spot.cityId] || ''
  const nameZh = locale.nameZh || ''
  const addressZh = locale.addressZh || (region && nameZh ? `${region}${nameZh}` : '')
  return { ...spot, nameZh, addressZh }
})

const missing = rows.filter((row) => !row.addressZh)
console.log(`Spots: ${rows.length}, with addressZh: ${rows.length - missing.length}, missing: ${missing.length}`)

const out = `export const TRAVEL_SPOT_CATALOG = ${JSON.stringify(rows, null, 2)}\n`
writeFileSync(new URL('../src/data/travelSpotCatalog.js', import.meta.url), out)

const localeOut = `export const CITY_REGION_ZH = ${JSON.stringify(CITY_REGION_ZH, null, 2)}\n`
writeFileSync(new URL('../src/data/spotLocale.js', import.meta.url), localeOut)
