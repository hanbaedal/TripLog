import type { GalleryCategory, GalleryPhoto, SightType } from '../types'
import { GALLERY_PHOTOS, cityGalleryId } from './galleryCatalog.js'
import { TRAVEL_SPOT_CATALOG } from './travelSpotCatalog.js'
import { guessSightType, normalizeGalleryCategory, normalizeSightType } from './galleryTaxonomy.js'

export type { GalleryPhoto }

export { GALLERY_PHOTOS, cityGalleryId }

type SpotRow = {
  id: string
  name: string
  src?: string
  cityId: string
}

const CATALOG_SPOT_PHOTOS: GalleryPhoto[] = (TRAVEL_SPOT_CATALOG as SpotRow[])
  .filter((spot) => Boolean(spot.src))
  .map((spot) => ({
    id: spot.id,
    title: spot.name,
    src: spot.src || '',
    city: cityGalleryId(spot.cityId),
    category: 'sight' as GalleryCategory,
    sightType: guessSightType(spot.name) as SightType,
    catalog: true,
  }))

const CATALOG_BY_ID = new Map<string, GalleryPhoto>([
  ...(GALLERY_PHOTOS as GalleryPhoto[]).map((row) => [row.id, row] as const),
  ...CATALOG_SPOT_PHOTOS.map((row) => [row.id, row] as const),
])

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
  const map = new Map<string, GalleryPhoto>()
  for (const row of CATALOG_BY_ID.values()) map.set(row.id, enrichGalleryPhoto(row))
  for (const row of userPhotos) map.set(row.id, enrichGalleryPhoto(row))
  return [...map.values()]
}
