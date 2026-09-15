import { Router } from 'express'
import { TourBusCity } from '../models.js'
import {
  KR_TOUR_BUS_CATALOG,
  TOUR_BUS_PILOT_CITIES,
  resolveTourBusCity,
} from '../../src/data/krTourBusCatalog.js'
import {
  discoverCityFromOpenData,
  listOpenDataCities,
  parseCityQuery,
} from '../lib/tourbusDiscover.js'

export const tourbusRouter = Router()

function catalogRow(citySlug) {
  return KR_TOUR_BUS_CATALOG.find((row) => row.city === citySlug) || null
}

function toCity(doc, extra = {}) {
  if (!doc) return null
  return {
    city: doc.city,
    cityLabel: doc.cityLabel,
    disclaimer: doc.disclaimer,
    sourceUrl: doc.sourceUrl,
    validUntil: doc.validUntil || undefined,
    courses: doc.courses || [],
    updatedAt: doc.updatedAt?.toISOString?.() ?? undefined,
    ...extra,
  }
}

async function loadDbCity(citySlug) {
  const doc = await TourBusCity.findOne({ city: citySlug }).lean()
  return doc || null
}

async function findDbCityByQuery(query) {
  const parsed = parseCityQuery(query)
  if (parsed.slug) {
    const hit = await loadDbCity(parsed.slug)
    if (hit) return hit
  }
  const tokens = parsed.tokens.map((t) => t.toLowerCase())
  if (!tokens.length) return null
  const rows = await TourBusCity.find({}, { city: 1, cityLabel: 1 }).lean()
  const match = rows.find((row) => {
    const hay = `${row.cityLabel} ${row.city}`.toLowerCase()
    return tokens.every((t) => hay.includes(t))
  })
  if (!match) return null
  return loadDbCity(match.city)
}

async function ensureCatalogCity(citySlug) {
  const seed = catalogRow(citySlug)
  if (!seed) return null

  const doc = await TourBusCity.findOneAndUpdate(
    { city: citySlug },
    {
      city: seed.city,
      cityLabel: seed.cityLabel,
      disclaimer: seed.disclaimer,
      sourceUrl: seed.sourceUrl,
      validUntil: seed.validUntil || '',
      courses: seed.courses,
      updatedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  return doc
}

async function saveCityDoc(cityDoc) {
  const doc = await TourBusCity.findOneAndUpdate(
    { city: cityDoc.city },
    {
      city: cityDoc.city,
      cityLabel: cityDoc.cityLabel,
      disclaimer: cityDoc.disclaimer || '',
      sourceUrl: cityDoc.sourceUrl || '',
      validUntil: cityDoc.validUntil || '',
      courses: cityDoc.courses || [],
      updatedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  return doc
}

function mergeCityLists(...lists) {
  const map = new Map()
  for (const list of lists) {
    for (const row of list) {
      if (!row?.city) continue
      map.set(row.city, { city: row.city, cityLabel: row.cityLabel })
    }
  }
  return [...map.values()].sort((a, b) => a.cityLabel.localeCompare(b.cityLabel, 'ko'))
}

tourbusRouter.get('/cities', async (_req, res) => {
  try {
    const dbRows = await TourBusCity.find({}, { city: 1, cityLabel: 1 }).lean()
    res.json({
      cities: mergeCityLists(
        TOUR_BUS_PILOT_CITIES,
        listOpenDataCities(),
        dbRows.map((row) => ({ city: row.city, cityLabel: row.cityLabel })),
      ),
    })
  } catch (err) {
    console.error('tourbus cities', err)
    res.json({ cities: mergeCityLists(TOUR_BUS_PILOT_CITIES, listOpenDataCities()) })
  }
})

tourbusRouter.post('/discover', async (req, res) => {
  const query = String(req.body?.query || '').trim()
  if (!query) {
    res.status(400).json({ status: 'invalid', error: '도시명을 입력해 주세요.' })
    return
  }

  try {
    const dbDoc = await findDbCityByQuery(query)
    if (dbDoc) {
      res.json({ status: 'found', source: 'db', saved: true, city: toCity(dbDoc) })
      return
    }

    const hit = discoverCityFromOpenData(query)
    if (hit.status === 'found' && hit.source === 'catalog') {
      const doc = await ensureCatalogCity(hit.city.city)
      res.json({ status: 'found', source: 'catalog', saved: true, city: toCity(doc) })
      return
    }

    if (hit.status === 'found' && hit.city) {
      const existing = await loadDbCity(hit.city.city)
      if (existing) {
        res.json({ status: 'found', source: 'db', saved: true, city: toCity(existing) })
        return
      }
      res.json(hit)
      return
    }

    res.json({ status: 'not_found', query, message: '이 도시는 시티투어버스를 운영하지 않습니다.' })
  } catch (err) {
    console.error('tourbus discover', err)
    res.status(500).json({ status: 'error', error: '투어버스 정보를 불러오지 못했습니다.' })
  }
})

tourbusRouter.post('/save', async (req, res) => {
  const cityDoc = req.body?.city
  if (!cityDoc?.city || !cityDoc?.cityLabel || !Array.isArray(cityDoc?.courses)) {
    res.status(400).json({ error: '저장할 도시 정보가 올바르지 않습니다.' })
    return
  }
  try {
    const doc = await saveCityDoc(cityDoc)
    res.json({ city: toCity(doc), saved: true })
  } catch (err) {
    console.error('tourbus save', err)
    res.status(500).json({ error: 'DB 저장에 실패했습니다.' })
  }
})

tourbusRouter.get('/:city', async (req, res) => {
  const citySlug = resolveTourBusCity(req.params.city) || decodeURIComponent(req.params.city)
  if (!citySlug) {
    res.status(404).json({ error: '도시를 찾을 수 없습니다.', city: null })
    return
  }

  try {
    const dbDoc = await loadDbCity(citySlug)
    if (dbDoc) {
      res.json({ city: toCity(dbDoc), saved: true })
      return
    }

    const catalog = catalogRow(citySlug)
    if (catalog) {
      const doc = await ensureCatalogCity(citySlug)
      res.json({ city: toCity(doc), saved: true, source: 'catalog' })
      return
    }

    res.status(404).json({ error: '이 도시의 투어버스 참고 일정은 아직 준비 중입니다.', city: null })
  } catch (err) {
    console.error('tourbus get city', err)
    const fallback = catalogRow(citySlug)
    if (fallback) {
      res.json({ city: fallback, cached: false })
      return
    }
    res.status(500).json({ error: '투어버스 정보를 불러오지 못했습니다.', city: null })
  }
})

export async function seedTourBus() {
  for (const row of KR_TOUR_BUS_CATALOG) {
    await ensureCatalogCity(row.city)
  }
}
