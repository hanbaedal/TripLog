import type { GalleryCategory, GalleryPhoto, SightType } from '../types'
import { FOOD_PHOTOS, GALLERY_PHOTOS, cityGalleryId } from './galleryCatalog.js'
import { guessSightType, normalizeGalleryCategory, normalizeSightType } from './galleryTaxonomy.js'

export type { GalleryPhoto }

export { GALLERY_PHOTOS, FOOD_PHOTOS, cityGalleryId }

const CATALOG_PHOTOS: GalleryPhoto[] = [
  ...(GALLERY_PHOTOS as GalleryPhoto[]),
  ...(FOOD_PHOTOS as GalleryPhoto[]),
]

const CATALOG_BY_ID = new Map<string, GalleryPhoto>(CATALOG_PHOTOS.map((row) => [row.id, row]))

function enrichGalleryPhoto(photo: GalleryPhoto): GalleryPhoto {
  const seed = CATALOG_BY_ID.get(photo.id)
  const category = normalizeGalleryCategory(photo.category || seed?.category || 'sight') as GalleryCategory
  const city = photo.city || seed?.city || 'dalian'
  const guessedSight =
    photo.sightType ||
    seed?.sightType ||
    (category === 'sight' ? guessSightType(photo.title || seed?.title || '') : '')
  const sightType = normalizeSightType(guessedSight, category) as SightType | undefined

  return {
    ...seed,
    ...photo,
    city,
    category,
    sightType: sightType || undefined,
    src: photo.src || seed?.src || '',
    title: photo.title || seed?.title || photo.id,
    catalog: Boolean(photo.catalog ?? seed?.catalog),
  }
}

export function galleryPhotoById(id?: string | null): GalleryPhoto | undefined {
  if (!id) return undefined
  return CATALOG_BY_ID.get(id)
}

export function mergeGallery(userPhotos: GalleryPhoto[]): GalleryPhoto[] {
  return userPhotos.map(enrichGalleryPhoto)
}
