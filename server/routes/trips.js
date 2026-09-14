import { Router } from 'express'
import { Sample, Trip } from '../models.js'
import { requireUser } from '../auth.js'

export const tripsRouter = Router()
tripsRouter.use(requireUser)

function toTrip(doc) {
  return {
    id: doc.tripId,
    title: doc.title,
    destination: doc.destination,
    startDate: doc.startDate,
    endDate: doc.endDate,
    adults: Math.max(1, Number(doc.adults) || 2),
    children: Math.max(0, Number(doc.children) || 0),
    items: doc.items || [],
    savedByUser: typeof doc.savedByUser === 'boolean' ? doc.savedByUser : undefined,
    publishedSampleId: doc.publishedSampleId || undefined,
    market: doc.market === 'kr' ? 'kr' : 'cn',
    updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  }
}

tripsRouter.get('/', async (req, res) => {
  const rows = await Trip.find({ ownerId: req.user._id }).sort({ updatedAt: -1 })
  res.json({ trips: rows.map(toTrip) })
})

tripsRouter.put('/:id', async (req, res) => {
  const tripId = req.params.id
  const body = req.body || {}
  if (!body.startDate || !body.endDate) {
    res.status(400).json({ error: '여행 날짜가 필요합니다.' })
    return
  }
  const doc = await Trip.findOneAndUpdate(
    { ownerId: req.user._id, tripId },
    {
      ownerId: req.user._id,
      tripId,
      title: body.title ?? '새로운 여행',
      destination: body.destination ?? '',
      startDate: body.startDate,
      endDate: body.endDate,
      adults: Math.max(1, Number(body.adults) || 2),
      children: Math.max(0, Number(body.children) || 0),
      items: Array.isArray(body.items) ? body.items : [],
      savedByUser: body.savedByUser === true,
      publishedSampleId: String(body.publishedSampleId || ''),
      market: body.market === 'kr' ? 'kr' : 'cn',
      updatedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  res.json({ trip: toTrip(doc) })
})

tripsRouter.delete('/:id', async (req, res) => {
  const existing = await Trip.findOne({ ownerId: req.user._id, tripId: req.params.id })
  if (existing?.publishedSampleId) {
    await Sample.deleteOne({ sampleId: existing.publishedSampleId, ownerId: String(req.user._id) })
  }
  await Trip.deleteOne({ ownerId: req.user._id, tripId: req.params.id })
  const rows = await Trip.find({ ownerId: req.user._id }).sort({ updatedAt: -1 })
  res.json({ trips: rows.map(toTrip) })
})
