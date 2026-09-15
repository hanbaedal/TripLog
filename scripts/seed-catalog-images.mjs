/**
 * 카탈로그 이미지 다운로드 + 갤러리 카탈로그 생성
 * Usage: node scripts/seed-catalog-images.mjs [cn-food|kr-spots|all]
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FOOD_PHOTOS } from '../src/data/galleryCatalog.js'
import { KR_GALLERY_PHOTOS } from '../src/data/krGalleryCatalog.js'
import { KR_TRAVEL_SPOT_CATALOG } from '../src/data/krTravelSpotCatalog.js'
import { KR_SUBWAY_SPOT_CATALOG } from '../src/data/krSubwayTravelCatalog.js'
import { commonsSearchThumb, commonsThumbForFile, downloadUrl, sleep } from './lib/commons.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const samplesDir = join(root, 'public', 'samples')
const spotsDir = join(samplesDir, 'spots')
const foodDir = join(samplesDir, 'food')

const CN_FOOD_WIKI = {
  'food-beijingkaoya': 'Peking duck.jpg',
  'food-mapodoufu': 'Authentic Mapo Tofu.jpg',
  'food-gongbaojiding': 'Kung Pao chicken.jpg',
  'food-tangculiji': 'Sweet and sour pork.jpg',
  'food-huoguo': 'Hot pot.jpg',
  'food-jiaozi': 'Jiaozi.jpg',
  'food-xiaolongbao': 'Xiaolongbao.jpg',
  'food-chaofan': 'Yangzhou fried rice and drinks 25-09-2019.jpg',
  'food-chunjuan': 'Spring rolls.jpg',
  'food-lamian': 'Lanzhou Ramen.JPG',
}

mkdirSync(samplesDir, { recursive: true })
mkdirSync(spotsDir, { recursive: true })
mkdirSync(foodDir, { recursive: true })

async function saveImage(url, destPath) {
  mkdirSync(dirname(destPath), { recursive: true })
  const buf = await downloadUrl(url, destPath)
  writeFileSync(destPath, buf)
  return buf.length
}

function regionFallbackPath(citySlug) {
  const direct = join(samplesDir, `${citySlug}.jpg`)
  if (existsSync(direct)) return direct
  return null
}

async function ensureLocal({ id, url, destPath, label, fallbackPath }) {
  if (existsSync(destPath) && readFileSync(destPath).length > 4096) {
    console.log(`skip ${label || id} (exists)`)
    return true
  }
  if (!url) {
    if (fallbackPath && existsSync(fallbackPath)) {
      copyFileSync(fallbackPath, destPath)
      console.log(`fallback ${label || id} ← ${fallbackPath}`)
      return true
    }
    console.warn(`missing url ${label || id}`)
    return false
  }
  const bytes = await saveImage(url, destPath)
  console.log(`saved ${label || id} (${bytes} bytes)`)
  await sleep(2200)
  return true
}

async function seedCnFood() {
  console.log('\n=== CN food → public/samples/food/ ===')
  const updates = []
  for (const row of FOOD_PHOTOS) {
    const wiki = CN_FOOD_WIKI[row.id]
    const dest = join(foodDir, `${row.id}.jpg`)
    const rel = `/samples/food/${row.id}.jpg`
    let url = null
    try {
      if (wiki) url = await commonsThumbForFile(wiki)
      if (!url) url = await commonsSearchThumb(`${row.title} China food`)
      const ok = await ensureLocal({ id: row.id, url, destPath: dest, label: row.title })
      if (ok) updates.push({ id: row.id, src: rel })
    } catch (err) {
      console.warn(`food ${row.id}: ${err.message}`)
      if (existsSync(dest) && readFileSync(dest).length > 4096) {
        updates.push({ id: row.id, src: rel })
      }
    }
  }
  patchGalleryCatalogFood(updates)
}

function patchGalleryCatalogFood(updates) {
  const path = join(root, 'src', 'data', 'galleryCatalog.js')
  let text = readFileSync(path, 'utf8')
  for (const { id, src } of updates) {
    const re = new RegExp(`(\\{ id: '${id}', title: [^,]+, src: )([^,]+)(, catalog: true)`)
    text = text.replace(re, `$1'${src}'$3`)
  }
  writeFileSync(path, text)
  console.log(`patched ${updates.length} food rows in galleryCatalog.js`)
}

function spotCitySlug(cityId) {
  return String(cityId || '').replace(/^info-/, '')
}

function guessSightType(name) {
  const t = String(name)
  if (/해|바다|해변|섬|호수|습지|만/.test(t)) return 'beach'
  if (/산|봉|국립공원|계곡|오름/.test(t)) return 'mountain'
  if (/사|절|불|왕릉|궁|성|유적|마을/.test(t)) return 'palace'
  if (/박물|미술|기념/.test(t)) return 'town'
  if (/정원|수목|숲|공원/.test(t)) return 'park'
  return 'town'
}

async function seedKrSpots() {
  console.log('\n=== KR 100선 spots → public/samples/spots/ ===')
  const existingIds = new Set(KR_GALLERY_PHOTOS.map((row) => row.id))
  const rows = []
  let ok = 0
  let miss = 0

  for (const spot of KR_TRAVEL_SPOT_CATALOG) {
    const dest = join(spotsDir, `${spot.id}.jpg`)
    const rel = `/samples/spots/${spot.id}.jpg`
    const city = spotCitySlug(spot.cityId)

    // 권역 대표 카드와 동일 id면 스킵
    if (existingIds.has(spot.id)) continue

    let url = null
    if (existsSync(dest) && readFileSync(dest).length > 4096) {
      ok++
    } else {
      try {
        url = await commonsSearchThumb(`${spot.name} South Korea`)
        if (!url) url = await commonsSearchThumb(`${spot.name} Korea`)
        const saved = await ensureLocal({
          id: spot.id,
          url,
          destPath: dest,
          label: spot.name,
          fallbackPath: regionFallbackPath(city),
        })
        if (saved) ok++
        else miss++
      } catch (err) {
        console.warn(`spot ${spot.name}: ${err.message}`)
        miss++
      }
    }

    if (existsSync(dest) && readFileSync(dest).length > 4096) {
      rows.push({
        id: spot.id,
        title: spot.name,
        src: rel,
        catalog: true,
        city,
        category: 'sight',
        sightType: guessSightType(spot.name),
        market: 'kr',
      })
    }
  }

  const outPath = join(root, 'src', 'data', 'krSpotGalleryCatalog.js')
  const body = `/** KR 100선 spot 갤러리 — scripts/seed-catalog-images.mjs 로 생성/갱신 */

export const KR_SPOT_GALLERY_PHOTOS = ${JSON.stringify(rows, null, 2)}
`
  writeFileSync(outPath, body)
  console.log(`KR spot gallery: ${rows.length} rows (${ok} images, ${miss} missing)`)
}

async function seedKrSubway() {
  console.log('\n=== KR subway gallery → public/samples/ ===')
  const subwayCover = join(samplesDir, 'kr-subway.jpg')
  if (!existsSync(subwayCover) || readFileSync(subwayCover).length <= 4096) {
    const fallback = join(samplesDir, 'kr-seoul.jpg')
    if (existsSync(fallback)) {
      copyFileSync(fallback, subwayCover)
      console.log('cover kr-subway ← kr-seoul.jpg')
    }
  }

  const byId = new Map()
  for (const spot of KR_SUBWAY_SPOT_CATALOG) {
    const id = String(spot.photoId || '')
    if (!id.startsWith('spot-kr-subway-') || byId.has(id)) continue
    byId.set(id, {
      id,
      title: spot.name,
      city: spot.subwayRegion === 'incheon' || spot.subwayRegion === 'gyeonggi' ? 'kr-gyeonggi' : 'kr-seoul',
    })
  }

  const rows = []
  for (const row of byId.values()) {
    const dest = join(spotsDir, `${row.id}.jpg`)
    const rel = `/samples/spots/${row.id}.jpg`
    const fallbackPath = regionFallbackPath(row.city || 'kr-seoul')
    if (existsSync(dest) && readFileSync(dest).length > 4096) {
      rows.push({
        id: row.id,
        title: row.title,
        src: rel,
        catalog: true,
        city: row.city,
        category: 'sight',
        sightType: guessSightType(row.title),
        market: 'kr',
      })
      continue
    }
    try {
      let url = await commonsSearchThumb(`${row.title} South Korea`)
      if (!url) url = await commonsSearchThumb(`${row.title} Korea`)
      const saved = await ensureLocal({
        id: row.id,
        url,
        destPath: dest,
        label: row.title,
        fallbackPath,
      })
      if (saved && existsSync(dest) && readFileSync(dest).length > 4096) {
        rows.push({
          id: row.id,
          title: row.title,
          src: rel,
          catalog: true,
          city: row.city,
          category: 'sight',
          sightType: guessSightType(row.title),
          market: 'kr',
        })
      }
    } catch (err) {
      console.warn(`subway ${row.id}: ${err.message}`)
      if (existsSync(dest) && readFileSync(dest).length > 4096) {
        rows.push({
          id: row.id,
          title: row.title,
          src: rel,
          catalog: true,
          city: row.city,
          category: 'sight',
          sightType: guessSightType(row.title),
          market: 'kr',
        })
      }
    }
  }

  const outPath = join(root, 'src', 'data', 'krSubwayGalleryCatalog.js')
  const body = `/** 전철타고 전용 갤러리 — scripts/seed-catalog-images.mjs kr-subway 로 생성/갱신 */

export const KR_SUBWAY_GALLERY_PHOTOS = ${JSON.stringify(rows, null, 2)}
`
  writeFileSync(outPath, body)
  console.log(`KR subway gallery: ${rows.length} rows`)
}

async function main() {
  const mode = process.argv[2] || 'all'
  if (mode === 'cn-food' || mode === 'all') await seedCnFood()
  if (mode === 'kr-spots' || mode === 'all') await seedKrSpots()
  if (mode === 'kr-subway' || mode === 'all') await seedKrSubway()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
