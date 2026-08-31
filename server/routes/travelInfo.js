import { Router } from 'express'
import crypto from 'node:crypto'
import { GalleryPhoto, TravelInfo, TravelSpot } from '../models.js'
import { requireUser, isSupervisorUser } from '../auth.js'
import { TRAVEL_INFO_CATALOG } from '../../src/data/travelInfoCatalog.js'
import { TRAVEL_SPOT_CATALOG } from '../../src/data/travelSpotCatalog.js'
import { cityGalleryId } from '../../src/data/galleryCatalog.js'

export const travelInfoRouter = Router()

function nid(prefix) {
  return `${prefix}-${crypto.randomUUID()}`
}

function toInfo(doc) {
  return {
    id: doc.infoId,
    place: doc.place,
    title: doc.title,
    body: doc.body,
    photoId: doc.photoId || '',
    src: doc.src || '',
    sort: doc.sort,
    catalog: Boolean(doc.catalog),
    ownerId: doc.ownerId ? String(doc.ownerId) : undefined,
    ownerName: doc.ownerName || '',
    at: doc.at?.toISOString?.() ?? new Date().toISOString(),
  }
}

function toSpot(doc) {
  return {
    id: doc.spotId,
    cityId: doc.cityId,
    name: doc.name,
    body: doc.body,
    tip: doc.tip || '',
    photoId: doc.photoId || '',
    src: doc.src || '',
    sort: doc.sort,
    catalog: Boolean(doc.catalog),
    ownerId: doc.ownerId ? String(doc.ownerId) : undefined,
    ownerName: doc.ownerName || '',
    at: doc.at?.toISOString?.() ?? new Date().toISOString(),
  }
}

function canManage(user, doc) {
  if (!user || !doc) return false
  if (isSupervisorUser(user)) return true
  if (doc.catalog) return false
  return Boolean(doc.ownerId && String(doc.ownerId) === String(user._id))
}

async function requirePhotoId(photoId) {
  const id = String(photoId || '').trim()
  if (!id) return null
  const photo = await GalleryPhoto.findOne({ photoId: id })
  if (!photo) return null
  return { photoId: id, src: photo.src }
}

export async function seedTravelInfo() {
  for (const row of TRAVEL_INFO_CATALOG) {
    const photoId = row.photoId || cityGalleryId(row.id)
    await TravelInfo.updateOne(
      { infoId: row.id },
      {
        $setOnInsert: {
          infoId: row.id,
          place: row.place,
          title: row.title,
          body: row.body,
          photoId,
          src: row.src || '',
          sort: row.sort,
          catalog: true,
          ownerName: '',
          at: new Date(),
        },
      },
      { upsert: true },
    )
  }
  for (const row of TRAVEL_SPOT_CATALOG) {
    const photoId = row.photoId || row.id
    await TravelSpot.updateOne(
      { spotId: row.id },
      {
        $setOnInsert: {
          spotId: row.id,
          cityId: row.cityId,
          name: row.name,
          body: row.body,
          tip: row.tip,
          photoId,
          src: row.src || '',
          sort: row.sort,
          catalog: true,
          ownerName: '',
          at: new Date(),
        },
      },
      { upsert: true },
    )
  }
}

travelInfoRouter.get('/', async (_req, res) => {
  const rows = await TravelInfo.find().sort({ sort: 1, at: -1 })
  res.json({ items: rows.map(toInfo) })
})

travelInfoRouter.get('/:cityId/spots', async (req, res) => {
  const rows = await TravelSpot.find({ cityId: req.params.cityId }).sort({ sort: 1, at: -1 })
  res.json({ spots: rows.map(toSpot) })
})

travelInfoRouter.post('/:cityId/spots', requireUser, async (req, res) => {
  const cityId = String(req.params.cityId || '').trim()
  const name = String(req.body?.name || '').trim()
  const body = String(req.body?.body || '').trim()
  const tip = String(req.body?.tip || '').trim()
  const photo = await requirePhotoId(req.body?.photoId)
  if (!cityId || !name || !body || !photo) {
    res.status(400).json({ error: '이름, 설명, 갤러리 사진이 필요합니다.' })
    return
  }
  const doc = await TravelSpot.create({
    spotId: nid('spot'),
    cityId,
    name,
    body,
    tip,
    photoId: photo.photoId,
    src: photo.src,
    sort: Number(req.body?.sort) || 80,
    catalog: false,
    ownerId: req.user._id,
    ownerName: req.user.name,
    at: new Date(),
  })
  res.json({ spot: toSpot(doc) })
})

travelInfoRouter.put('/spots/:id', requireUser, async (req, res) => {
  const doc = await TravelSpot.findOne({ spotId: req.params.id })
  if (!doc || !canManage(req.user, doc)) {
    res.status(404).json({ error: '관광지를 찾지 못했거나 권한이 없습니다.' })
    return
  }
  const name = String(req.body?.name || '').trim()
  const body = String(req.body?.body || '').trim()
  const tip = String(req.body?.tip || '').trim()
  const photo = await requirePhotoId(req.body?.photoId)
  if (!name || !body || !photo) {
    res.status(400).json({ error: '이름, 설명, 갤러리 사진이 필요합니다.' })
    return
  }
  doc.name = name
  doc.body = body
  doc.tip = tip
  doc.photoId = photo.photoId
  doc.src = photo.src
  if (req.body?.sort != null) doc.sort = Number(req.body.sort) || doc.sort
  await doc.save()
  res.json({ spot: toSpot(doc) })
})

travelInfoRouter.delete('/spots/:id', requireUser, async (req, res) => {
  const doc = await TravelSpot.findOne({ spotId: req.params.id })
  if (!doc || !canManage(req.user, doc)) {
    res.status(404).json({ error: '관광지를 찾지 못했거나 권한이 없습니다.' })
    return
  }
  await doc.deleteOne()
  res.json({ ok: true })
})

travelInfoRouter.post('/', requireUser, async (req, res) => {
  const place = String(req.body?.place || '').trim()
  const title = String(req.body?.title || place).trim()
  const body = String(req.body?.body || '').trim()
  const photo = await requirePhotoId(req.body?.photoId)
  if (!place || !title || !body || !photo) {
    res.status(400).json({ error: '도시, 제목, 설명, 갤러리 사진이 필요합니다.' })
    return
  }
  const doc = await TravelInfo.create({
    infoId: nid('info'),
    place,
    title,
    body,
    photoId: photo.photoId,
    src: photo.src,
    sort: Number(req.body?.sort) || 80,
    catalog: false,
    ownerId: req.user._id,
    ownerName: req.user.name,
    at: new Date(),
  })
  res.json({ item: toInfo(doc) })
})

travelInfoRouter.put('/:id', requireUser, async (req, res) => {
  const doc = await TravelInfo.findOne({ infoId: req.params.id })
  if (!doc || !canManage(req.user, doc)) {
    res.status(404).json({ error: '글을 찾지 못했거나 권한이 없습니다.' })
    return
  }
  const place = String(req.body?.place || '').trim()
  const title = String(req.body?.title || place).trim()
  const body = String(req.body?.body || '').trim()
  const photo = await requirePhotoId(req.body?.photoId)
  if (!place || !title || !body || !photo) {
    res.status(400).json({ error: '도시, 제목, 설명, 갤러리 사진이 필요합니다.' })
    return
  }
  doc.place = place
  doc.title = title
  doc.body = body
  doc.photoId = photo.photoId
  doc.src = photo.src
  if (req.body?.sort != null) doc.sort = Number(req.body.sort) || doc.sort
  await doc.save()
  res.json({ item: toInfo(doc) })
})

travelInfoRouter.delete('/:id', requireUser, async (req, res) => {
  const doc = await TravelInfo.findOne({ infoId: req.params.id })
  if (!doc || !canManage(req.user, doc)) {
    res.status(404).json({ error: '글을 찾지 못했거나 권한이 없습니다.' })
    return
  }
  await TravelSpot.deleteMany({ cityId: doc.infoId })
  await doc.deleteOne()
  res.json({ ok: true })
})
