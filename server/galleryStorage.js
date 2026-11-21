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

/** Render 등 ephemeral 디스크에서는 파일을 쓰면 재배포 후 이미지가 사라진다. */
export function storeGalleryAsFiles() {
  const flag = String(process.env.GALLERY_STORE_FILES || '').trim().toLowerCase()
  return flag === '1' || flag === 'true' || flag === 'yes'
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

export function galleryMediaApiPath(photoId) {
  return `/api/gallery/${encodeURIComponent(String(photoId || ''))}/media`
}

export function parseDataUrl(src) {
  const match = String(src).match(/^data:image\/(\w+);base64,(.+)$/i)
  if (!match) throw new Error('사진 형식을 확인해 주세요.')
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > 3_500_000) throw new Error('사진이 너무 큽니다.')
  return { buffer, subtype: match[1].toLowerCase() }
}

export async function saveGalleryImage(photoId, src) {
  if (!isDataUrl(src)) return String(src || '').trim()
  // 기본: MongoDB에 data URL 유지 (재배포에도 남음)
  if (!storeGalleryAsFiles()) return String(src).trim()
  const { buffer } = parseDataUrl(src)
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

export function publicGallerySrc(doc) {
  const src = String(doc?.src || '').trim()
  if (!src) return ''
  if (isDataUrl(src) || isStoredUploadUrl(src)) return galleryMediaApiPath(doc.photoId)
  return src
}

export async function readGalleryMedia(doc) {
  const src = String(doc?.src || '').trim()
  if (!src) return null
  if (isDataUrl(src)) {
    const { buffer, subtype } = parseDataUrl(src)
    return { buffer, contentType: subtype === 'png' ? 'image/png' : 'image/jpeg' }
  }
  if (isStoredUploadUrl(src)) {
    try {
      const buffer = await fs.readFile(galleryFilePath(doc.photoId))
      return { buffer, contentType: 'image/jpeg' }
    } catch (err) {
      if (err?.code === 'ENOENT') return null
      throw err
    }
  }
  return null
}

/** 파일 저장 모드일 때만 data URL → 파일 이관. 기본은 no-op. */
export async function migrateGalleryDataUrls() {
  if (!storeGalleryAsFiles()) {
    console.log('gallery: inline DB photos enabled (set GALLERY_STORE_FILES=1 only with persistent disk)')
    return
  }
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
