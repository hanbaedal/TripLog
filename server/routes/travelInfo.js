import { Router } from 'express'
import crypto from 'node:crypto'
import { TravelInfo } from '../models.js'
import { requireUser, isSupervisorUser } from '../auth.js'
import { TRAVEL_INFO_CATALOG } from '../../src/data/travelInfoCatalog.js'

export const travelInfoRouter = Router()

function nid() {
  return `info-${crypto.randomUUID()}`
}

function toInfo(doc) {
  return {
    id: doc.infoId,
    place: doc.place,
    title: doc.title,
    body: doc.body,
    src: doc.src,
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

export async function seedTravelInfo() {
  for (const row of TRAVEL_INFO_CATALOG) {
    await TravelInfo.updateOne(
      { infoId: row.id },
      {
        $setOnInsert: {
          infoId: row.id,
          place: row.place,
          title: row.title,
          body: row.body,
          src: row.src,
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

travelInfoRouter.post('/', requireUser, async (req, res) => {
  const place = String(req.body?.place || '').trim()
  const title = String(req.body?.title || place).trim()
  const body = String(req.body?.body || '').trim()
  const src = String(req.body?.src || '').trim()
  if (!place || !title || !body || !src) {
    res.status(400).json({ error: '도시, 제목, 설명, 사진이 필요합니다.' })
    return
  }
  if (src.length > 4_500_000) {
    res.status(400).json({ error: '사진이 너무 큽니다.' })
    return
  }
  const doc = await TravelInfo.create({
    infoId: nid(),
    place,
    title,
    body,
    src,
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
  const src = String(req.body?.src || '').trim()
  if (!place || !title || !body || !src) {
    res.status(400).json({ error: '도시, 제목, 설명, 사진이 필요합니다.' })
    return
  }
  if (src.length > 4_500_000) {
    res.status(400).json({ error: '사진이 너무 큽니다.' })
    return
  }
  doc.place = place
  doc.title = title
  doc.body = body
  doc.src = src
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
  await doc.deleteOne()
  res.json({ ok: true })
})
