import { Router } from 'express'
import crypto from 'node:crypto'
import { BoardPost, GalleryPhoto, Inquiry } from '../models.js'
import { optionalUser, requireSupervisor, requireUser, supervisorRole } from '../auth.js'

function nid(prefix) {
  return `${prefix}-${crypto.randomUUID()}`
}

function toPhoto(doc) {
  return {
    id: doc.photoId,
    title: doc.title,
    src: doc.src,
    ownerId: String(doc.ownerId),
    ownerName: doc.ownerName || '',
    at: doc.at?.toISOString?.() ?? new Date().toISOString(),
  }
}

function toPost(doc) {
  return {
    id: doc.postId,
    name: doc.name,
    title: doc.title,
    body: doc.body,
    ownerId: doc.ownerId ? String(doc.ownerId) : undefined,
    at: doc.at?.toISOString?.() ?? new Date().toISOString(),
  }
}

function toInquiry(doc) {
  return {
    id: doc.inquiryId,
    name: doc.name,
    email: doc.email,
    message: doc.message,
    ownerId: doc.ownerId ? String(doc.ownerId) : undefined,
    at: doc.at?.toISOString?.() ?? new Date().toISOString(),
    reply: doc.reply || undefined,
    replyAt: doc.replyAt?.toISOString?.(),
  }
}

function isSupervisor(user) {
  if (!user) return false
  return user.role === 'supervisor' || supervisorRole(user.name, user.email) === 'supervisor'
}

export const galleryRouter = Router()

galleryRouter.get('/', async (_req, res) => {
  const rows = await GalleryPhoto.find().sort({ at: 1 })
  res.json({ photos: rows.map(toPhoto) })
})

galleryRouter.post('/', requireUser, async (req, res) => {
  const title = String(req.body?.title || '').trim()
  const src = String(req.body?.src || '').trim()
  if (!title || !src) {
    res.status(400).json({ error: '제목과 사진이 필요합니다.' })
    return
  }
  if (src.length > 4_500_000) {
    res.status(400).json({ error: '사진이 너무 큽니다.' })
    return
  }
  const doc = await GalleryPhoto.create({
    photoId: nid('gal'),
    ownerId: req.user._id,
    ownerName: req.user.name,
    title,
    src,
    at: new Date(),
  })
  res.json({ photo: toPhoto(doc) })
})

galleryRouter.put('/:id', requireUser, async (req, res) => {
  const title = String(req.body?.title || '').trim()
  const src = String(req.body?.src || '').trim()
  if (!title || !src) {
    res.status(400).json({ error: '제목과 사진이 필요합니다.' })
    return
  }
  const doc = await GalleryPhoto.findOne({ photoId: req.params.id, ownerId: req.user._id })
  if (!doc) {
    res.status(404).json({ error: '사진을 찾지 못했습니다.' })
    return
  }
  doc.title = title
  doc.src = src
  await doc.save()
  res.json({ photo: toPhoto(doc) })
})

galleryRouter.delete('/:id', requireUser, async (req, res) => {
  const result = await GalleryPhoto.deleteOne({ photoId: req.params.id, ownerId: req.user._id })
  if (!result.deletedCount) {
    res.status(404).json({ error: '사진을 찾지 못했습니다.' })
    return
  }
  res.json({ ok: true })
})

export const boardRouter = Router()

boardRouter.get('/', async (_req, res) => {
  const rows = await BoardPost.find().sort({ at: -1 }).limit(200)
  res.json({ posts: rows.map(toPost) })
})

boardRouter.post('/', optionalUser, async (req, res) => {
  const title = String(req.body?.title || '').trim()
  const body = String(req.body?.body || '').trim()
  const name = String(req.user?.name || req.body?.name || '').trim()
  if (!title || !body || !name) {
    res.status(400).json({ error: '이름, 제목, 내용이 필요합니다.' })
    return
  }
  const doc = await BoardPost.create({
    postId: nid('post'),
    ownerId: req.user?._id || null,
    name,
    title,
    body,
    at: new Date(),
  })
  res.json({ post: toPost(doc) })
})

export const inquiryRouter = Router()

inquiryRouter.get('/', optionalUser, async (req, res) => {
  if (isSupervisor(req.user)) {
    const rows = await Inquiry.find().sort({ at: -1 }).limit(300)
    res.json({ inquiries: rows.map(toInquiry) })
    return
  }
  if (req.user) {
    const rows = await Inquiry.find({ ownerId: req.user._id }).sort({ at: -1 })
    res.json({ inquiries: rows.map(toInquiry) })
    return
  }
  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40)
  if (!ids.length) {
    res.json({ inquiries: [] })
    return
  }
  const rows = await Inquiry.find({ inquiryId: { $in: ids } }).sort({ at: -1 })
  res.json({ inquiries: rows.map(toInquiry) })
})

inquiryRouter.post('/', optionalUser, async (req, res) => {
  const name = String(req.user?.name || req.body?.name || '').trim()
  const email = String(req.user?.email || req.body?.email || '').trim()
  const message = String(req.body?.message || '').trim()
  if (!name || !email || !message) {
    res.status(400).json({ error: '이름, 이메일, 문의 내용이 필요합니다.' })
    return
  }
  const doc = await Inquiry.create({
    inquiryId: nid('inq'),
    ownerId: req.user?._id || null,
    name,
    email,
    message,
    at: new Date(),
  })
  res.json({ inquiry: toInquiry(doc) })
})

inquiryRouter.patch('/:id/reply', requireSupervisor, async (req, res) => {
  const reply = String(req.body?.reply || '').trim()
  if (!reply) {
    res.status(400).json({ error: '답변을 적어 주세요.' })
    return
  }
  const doc = await Inquiry.findOne({ inquiryId: req.params.id })
  if (!doc) {
    res.status(404).json({ error: '문의를 찾지 못했습니다.' })
    return
  }
  doc.reply = reply
  doc.replyAt = new Date()
  await doc.save()
  res.json({ inquiry: toInquiry(doc) })
})
