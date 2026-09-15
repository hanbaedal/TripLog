import { Router } from 'express'
import { TourBusCity } from '../models.js'
import {
  KR_TOUR_BUS_CATALOG,
  TOUR_BUS_PILOT_CITIES,
  resolveTourBusCity,
} from '../../src/data/krTourBusCatalog.js'

export const tourbusRouter = Router()

function catalogRow(citySlug) {
  return KR_TOUR_BUS_CATALOG.find((row) => row.city === citySlug) || null
}

function toCity(doc) {
  if (!doc) return null
  return {
    city: doc.city,
    cityLabel: doc.cityLabel,
    disclaimer: doc.disclaimer,
    sourceUrl: doc.sourceUrl,
    validUntil: doc.validUntil || undefined,
    courses: doc.courses || [],
    updatedAt: doc.updatedAt?.toISOString?.() ?? undefined,
  }
}

async function ensureCity(citySlug) {
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

tourbusRouter.get('/cities', (_req, res) => {
  res.json({ cities: TOUR_BUS_PILOT_CITIES })
})

tourbusRouter.get('/:city', async (req, res) => {
  const citySlug = resolveTourBusCity(req.params.city) || req.params.city
  if (!catalogRow(citySlug)) {
    res.status(404).json({ error: '이 도시의 투어버스 참고 일정은 아직 준비 중입니다.', city: null })
    return
  }
  try {
    const doc = await ensureCity(citySlug)
    res.json({ city: toCity(doc) })
  } catch (err) {
    console.error('tourbus ensureCity', err)
    const fallback = catalogRow(citySlug)
    res.json({ city: fallback, cached: false })
  }
})

export async function seedTourBus() {
  for (const row of KR_TOUR_BUS_CATALOG) {
    await ensureCity(row.city)
  }
}
