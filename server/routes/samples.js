import { Router } from 'express'
import { Sample } from '../models.js'
import { requireSupervisor } from '../auth.js'
import { SAMPLE_CATALOG } from '../../src/data/sampleCatalog.js'

export const samplesRouter = Router()

function toSample(doc) {
  return {
    id: doc.sampleId,
    sort: doc.sort,
    nights: doc.nights,
    place: doc.place,
    title: doc.title,
    destination: doc.destination,
    trip: doc.trip,
  }
}

export async function seedSamples() {
  const n = await Sample.countDocuments()
  if (n > 0) return
  await Sample.insertMany(
    SAMPLE_CATALOG.map((row) => ({
      sampleId: row.id,
      sort: row.sort,
      nights: row.nights,
      place: row.place,
      title: row.title,
      destination: row.destination,
      trip: row.trip,
    })),
  )
}

function payload(body, fallbackId) {
  const trip = body.trip || {}
  const place = String(body.place || trip.destination || '새 여행지').trim()
  return {
    sampleId: String(body.id || fallbackId || '').trim(),
    sort: Number(body.sort) || 99,
    nights: Math.max(1, Number(body.nights) || 3),
    place,
    title: String(body.title || trip.title || place).trim(),
    destination: String(body.destination || trip.destination || place).trim(),
    trip,
  }
}

samplesRouter.get('/', async (_req, res) => {
  const rows = await Sample.find().sort({ nights: 1, sort: 1 })
  res.json({ samples: rows.map(toSample) })
})

samplesRouter.post('/', requireSupervisor, async (req, res) => {
  const doc = payload(req.body, `sample-${Date.now()}`)
  if (!doc.sampleId) {
    res.status(400).json({ error: '샘플 아이디가 필요합니다.' })
    return
  }
  const created = await Sample.create(doc)
  res.status(201).json({ sample: toSample(created) })
})

samplesRouter.put('/:id', requireSupervisor, async (req, res) => {
  const sampleId = req.params.id
  const doc = payload({ ...req.body, id: sampleId }, sampleId)
  const updated = await Sample.findOneAndUpdate(
    { sampleId },
    doc,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  res.json({ sample: toSample(updated) })
})

samplesRouter.delete('/:id', requireSupervisor, async (req, res) => {
  await Sample.deleteOne({ sampleId: req.params.id })
  const rows = await Sample.find().sort({ nights: 1, sort: 1 })
  res.json({ samples: rows.map(toSample) })
})
