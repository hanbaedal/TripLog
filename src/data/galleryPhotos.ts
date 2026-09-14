import type { GalleryCategory, GalleryPhoto, SightType } from '../types'
import { FOOD_PHOTOS, GALLERY_PHOTOS, cityGalleryId } from './galleryCatalog.js'
import { KR_GALLERY_PHOTOS } from './krGalleryCatalog.js'
import { guessSightType, normalizeGalleryCategory, normalizeSightType } from './galleryTaxonomy.js'

export type { GalleryPhoto }

export { GALLERY_PHOTOS, FOOD_PHOTOS, cityGalleryId }

const CATALOG_PHOTOS: GalleryPhoto[] = [
  ...(GALLERY_PHOTOS as GalleryPhoto[]).map((row) => ({ ...row, market: 'cn' as const })),
  ...(FOOD_PHOTOS as GalleryPhoto[]).map((row) => ({ ...row, market: 'cn' as const })),
  ...(KR_GALLERY_PHOTOS as GalleryPhoto[]),
]

const CATALOG_BY_ID = new Map<string, GalleryPhoto>(CATALOG_PHOTOS.map((row) => [row.id, row]))

export function hasDisplayableGallerySrc(photo: Pick<GalleryPhoto, 'src'>): boolean {
  return Boolean((photo.src || '').trim())
}

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
  const byId = new Map<string, GalleryPhoto>()
  for (const row of CATALOG_PHOTOS) {
    if (hasDisplayableGallerySrc(row)) byId.set(row.id, enrichGalleryPhoto(row))
  }
  for (const row of userPhotos) {
    const enriched = enrichGalleryPhoto(row)
    if (!hasDisplayableGallerySrc(enriched)) continue
    const seed = byId.get(enriched.id)
    byId.set(enriched.id, seed ? { ...seed, ...enriched } : enriched)
  }
  return [...byId.values()]
}
