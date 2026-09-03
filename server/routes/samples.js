import { Router } from 'express'
import { Sample, Trip } from '../models.js'
import { isSupervisorUser, requireUser } from '../auth.js'
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
    ownerId: doc.ownerId || undefined,
    ownerName: doc.ownerName || undefined,
    sourceTripId: doc.sourceTripId || undefined,
  }
}

function ownerKey(user) {
  return String(user?._id || user?.id || '')
}

function canManage(user, doc) {
  if (!user || !doc) return false
  if (isSupervisorUser(user)) return true
  return Boolean(doc.ownerId && doc.ownerId === ownerKey(user))
}

export async function seedSamples() {
  for (const row of SAMPLE_CATALOG) {
    await Sample.updateOne(
      { sampleId: row.id },
      {
        $set: {
          sort: row.sort,
          nights: row.nights,
          place: row.place,
          title: row.title,
          destination: row.destination,
          trip: row.trip,
        },
        $setOnInsert: {
          sampleId: row.id,
        },
      },
      { upsert: true },
    )
  }
}

function payload(body, fallbackId, user) {
  const trip = body.trip || {}
  const place = String(body.place || trip.destination || '새 여행지').trim()
  const ownerId = String(body.ownerId || (user && !isSupervisorUser(user) ? ownerKey(user) : '') || '')
  return {
    sampleId: String(body.id || fallbackId || '').trim(),
    sort: Number(body.sort) || 80,
    nights: Math.max(1, Number(body.nights) || 3),
    place,
    title: String(body.title || trip.title || place).trim(),
    destination: String(body.destination || trip.destination || place).trim(),
    trip,
    ownerId,
    ownerName: String(body.ownerName || user?.name || '').trim(),
    sourceTripId: String(body.sourceTripId || trip.id || '').trim(),
  }
}

samplesRouter.get('/', async (_req, res) => {
  const rows = await Sample.find().sort({ nights: 1, sort: 1 })
  res.json({ samples: rows.map(toSample) })
})

samplesRouter.post('/', requireUser, async (req, res) => {
  const member = !isSupervisorUser(req.user)
  const doc = payload(req.body, member ? `sample-${Date.now()}` : req.body?.id, req.user)
  if (member) {
    doc.ownerId = ownerKey(req.user)
    doc.ownerName = req.user.name
    if (!doc.sampleId) doc.sampleId = `sample-${Date.now()}`
  }
  if (!doc.sampleId) {
    res.status(400).json({ error: '샘플 아이디가 필요합니다.' })
    return
  }
  const created = await Sample.create(doc)
  if (created.sourceTripId && created.ownerId) {
    await Trip.updateOne(
      { ownerId: req.user._id, tripId: created.sourceTripId },
      { publishedSampleId: created.sampleId },
    )
  }
  res.status(201).json({ sample: toSample(created) })
})

samplesRouter.put('/:id', requireUser, async (req, res) => {
  const sampleId = req.params.id
  const existing = await Sample.findOne({ sampleId })
  if (existing && !canManage(req.user, existing)) {
    res.status(403).json({ error: '권한이 없습니다.' })
    return
  }
  if (!existing && !isSupervisorUser(req.user)) {
    res.status(403).json({ error: '권한이 없습니다.' })
    return
  }
  const doc = payload({ ...req.body, id: sampleId }, sampleId, req.user)
  if (existing?.ownerId) {
    doc.ownerId = existing.ownerId
    doc.ownerName = existing.ownerName || doc.ownerName
  }
  const updated = await Sample.findOneAndUpdate(
    { sampleId },
    doc,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  res.json({ sample: toSample(updated) })
})

samplesRouter.delete('/:id', requireUser, async (req, res) => {
  const existing = await Sample.findOne({ sampleId: req.params.id })
  if (!existing) {
    const rows = await Sample.find().sort({ nights: 1, sort: 1 })
    res.json({ samples: rows.map(toSample) })
    return
  }
  if (!canManage(req.user, existing)) {
    res.status(403).json({ error: '권한이 없습니다.' })
    return
  }
  await Sample.deleteOne({ sampleId: existing.sampleId })
  if (existing.sourceTripId) {
    await Trip.updateMany(
      { publishedSampleId: existing.sampleId },
      { $set: { publishedSampleId: '' } },
    )
  }
  const rows = await Sample.find().sort({ nights: 1, sort: 1 })
  res.json({ samples: rows.map(toSample) })
})
