import { writeFileSync } from 'node:fs'
import { TRAVEL_SPOT_CATALOG } from '../src/data/travelSpotCatalog.js'
import { SPOT_WIKI_FILES } from './spot-photo-data.mjs'

function wm(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`
}

const rows = TRAVEL_SPOT_CATALOG.map((spot) => {
  const file = SPOT_WIKI_FILES[spot.id]
  if (!file) console.warn(`Missing wiki file for ${spot.id} (${spot.name})`)
  return { ...spot, src: file ? wm(file) : spot.src || '' }
})

const uniqueSrc = new Set(rows.map((row) => row.src).filter(Boolean))
const missing = rows.filter((row) => !row.src)
console.log(`Spots: ${rows.length}, unique images: ${uniqueSrc.size}, missing: ${missing.length}`)

const out = `export const TRAVEL_SPOT_CATALOG = ${JSON.stringify(rows, null, 2)}\n`
writeFileSync(new URL('../src/data/travelSpotCatalog.js', import.meta.url), out)

const byId = Object.fromEntries(rows.filter((row) => row.src).map((row) => [row.id, row.src]))
const byIdOut = `export const SPOT_PHOTO_SRC = ${JSON.stringify(byId, null, 2)}\n`
writeFileSync(new URL('../src/data/spotPhotoById.js', import.meta.url), byIdOut)
