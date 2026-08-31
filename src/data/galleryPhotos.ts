import type { GalleryPhoto } from '../types'
import { GALLERY_PHOTOS, cityGalleryId } from './galleryCatalog.js'

export type { GalleryPhoto }

export { GALLERY_PHOTOS, cityGalleryId }

export function galleryPhotoById(id?: string | null): GalleryPhoto | undefined {
  if (!id) return undefined
  return (GALLERY_PHOTOS as GalleryPhoto[]).find((row) => row.id === id)
}

export function mergeGallery(userPhotos: GalleryPhoto[]): GalleryPhoto[] {
  const map = new Map<string, GalleryPhoto>()
  for (const row of GALLERY_PHOTOS as GalleryPhoto[]) map.set(row.id, row)
  for (const row of userPhotos) map.set(row.id, row)
  return [...map.values()]
}
