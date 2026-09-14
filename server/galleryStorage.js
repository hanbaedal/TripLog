import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GalleryPhoto } from './models.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function uploadRoot() {
  return process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads')
}

export function galleryUploadDir() {
  return path.join(uploadRoot(), 'gallery')
}

export async function ensureGalleryUploadDir() {
  await fs.mkdir(galleryUploadDir(), { recursive: true })
}

export function isDataUrl(src) {
  return /^data:image\//i.test(String(src || ''))
}

export function isStoredUploadUrl(src) {
  return String(src || '').startsWith('/uploads/gallery/')
}

export function galleryFilePath(photoId) {
  const safe = String(photoId || '').replace(/[^\w-]/g, '')
  if (!safe) throw new Error('Invalid photo id')
  return path.join(galleryUploadDir(), `${safe}.jpg`)
}

export function galleryPublicUrl(photoId) {
  const safe = String(photoId || '').replace(/[^\w-]/g, '')
  return `/uploads/gallery/${safe}.jpg`
}

function parseDataUrl(src) {
  const match = String(src).match(/^data:image\/(\w+);base64,(.+)$/i)
  if (!match) throw new Error('사진 형식을 확인해 주세요.')
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > 3_500_000) throw new Error('사진이 너무 큽니다.')
  return buffer
}

export async function saveGalleryImage(photoId, src) {
  if (!isDataUrl(src)) return String(src || '').trim()
  const buffer = parseDataUrl(src)
  await ensureGalleryUploadDir()
  await fs.writeFile(galleryFilePath(photoId), buffer)
  return galleryPublicUrl(photoId)
}

export async function deleteGalleryFile(photoId, src) {
  if (!isStoredUploadUrl(src)) return
  try {
    await fs.unlink(galleryFilePath(photoId))
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err
  }
}

export async function resolveGallerySrc(photoId, src, previousSrc) {
  const next = await saveGalleryImage(photoId, src)
  if (previousSrc && isStoredUploadUrl(previousSrc) && previousSrc !== next) {
    await deleteGalleryFile(photoId, previousSrc)
  }
  return next
}

export async function migrateGalleryDataUrls() {
  const rows = await GalleryPhoto.find({ src: /^data:image\//i })
  for (const doc of rows) {
    try {
      doc.src = await saveGalleryImage(doc.photoId, doc.src)
      await doc.save()
    } catch (err) {
      console.error(`gallery migrate failed for ${doc.photoId}:`, err.message)
    }
  }
  if (rows.length) console.log(`gallery migrated ${rows.length} inline photo(s) to files`)
}
