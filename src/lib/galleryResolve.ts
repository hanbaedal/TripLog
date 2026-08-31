import type { GalleryPhoto, User } from '../types'
import { GALLERY_PHOTOS } from '../data/galleryCatalog.js'
import { compressImage } from './imageFile'

let cache: GalleryPhoto[] | null = null

export function invalidateGalleryCache() {
  cache = null
}

export async function loadGalleryPhotos(): Promise<GalleryPhoto[]> {
  if (!cache) {
    const { listGallery } = await import('./community')
    cache = await listGallery()
  }
  return cache
}

export function resolvePhotoSrc(
  photoId: string | undefined | null,
  photos: GalleryPhoto[] = GALLERY_PHOTOS as GalleryPhoto[],
  legacySrc?: string,
): string {
  const id = (photoId || '').trim()
  if (id) {
    const found = photos.find((row) => row.id === id)
    if (found?.src) return found.src
    const catalog = (GALLERY_PHOTOS as GalleryPhoto[]).find((row) => row.id === id)
    if (catalog?.src) return catalog.src
  }
  return legacySrc?.trim() || ''
}

export function pickableGalleryPhotos(
  photos: GalleryPhoto[],
  user?: User | null,
  scope: 'default' | 'mine' | 'all' = 'default',
): GalleryPhoto[] {
  if (scope === 'all') return photos
  if (scope === 'mine' && user) return photos.filter((row) => !row.catalog && row.ownerId === user.id)
  if (!user) return photos.filter((row) => row.catalog)
  return photos.filter((row) => row.catalog || row.ownerId === user.id)
}

export async function uploadGalleryImage(
  file: File,
  user: User,
  title?: string,
): Promise<GalleryPhoto> {
  const { saveGalleryPhoto } = await import('./community')
  const src = await compressImage(file)
  const saved = await saveGalleryPhoto({
    id: '',
    title: title?.trim() || file.name.replace(/\.[^.]+$/, '') || '내 사진',
    src,
    ownerId: user.id,
    ownerName: user.name,
  })
  invalidateGalleryCache()
  return saved
}
