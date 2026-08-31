import type { ItemKind } from '../types'
import {
  GALLERY_CATEGORIES,
  GALLERY_CITIES,
  SIGHT_TYPES,
  citySlugFromPlace,
  galleryCategoryLabel,
  galleryCityLabel,
  guessSightType,
  normalizeCity,
  normalizeGalleryCategory,
  normalizeSightType,
  sightTypeLabel,
} from '../data/galleryTaxonomy.js'
import type { GalleryCategory, GalleryPhoto, SightType } from '../types'

export {
  GALLERY_CATEGORIES,
  GALLERY_CITIES,
  SIGHT_TYPES,
  citySlugFromPlace,
  galleryCategoryLabel,
  galleryCityLabel,
  guessSightType,
  normalizeCity,
  normalizeGalleryCategory,
  normalizeSightType,
  sightTypeLabel,
}

export type GalleryFilter = {
  city?: string
  category?: GalleryCategory | ItemKind | 'other'
  sightType?: SightType
}

export function itemKindToGalleryCategory(kind?: ItemKind): GalleryCategory | undefined {
  if (!kind || kind === 'flight') return kind === 'flight' ? 'flight' : undefined
  return kind
}

export function filterGalleryPhotos(
  photos: GalleryPhoto[],
  filter?: GalleryFilter,
): { items: GalleryPhoto[]; relaxed: boolean } {
  if (!filter?.city && !filter?.category && !filter?.sightType) {
    return { items: photos, relaxed: false }
  }

  const strict = photos.filter((row) => matchPhoto(row, filter, true))
  if (strict.length) return { items: strict, relaxed: false }

  if (filter.category) {
    const byCategory = photos.filter((row) => row.category === filter.category)
    if (byCategory.length) return { items: byCategory, relaxed: true }
  }

  if (filter.city) {
    const byCity = photos.filter((row) => row.city === filter.city)
    if (byCity.length) return { items: byCity, relaxed: true }
  }

  return { items: photos, relaxed: true }
}

function matchPhoto(row: GalleryPhoto, filter: GalleryFilter, strictSight: boolean): boolean {
  if (filter.category && row.category !== filter.category) return false
  if (filter.city && row.city !== filter.city && row.city !== 'other') return false
  if (filter.sightType && row.category === 'sight') {
    if (strictSight && row.sightType && row.sightType !== filter.sightType) return false
  }
  return true
}

export function buildGalleryFilter(opts?: {
  tripDestination?: string
  itemKind?: ItemKind
  itemTitle?: string
}): GalleryFilter | undefined {
  if (!opts?.itemKind || opts.itemKind === 'flight') return undefined
  const category = itemKindToGalleryCategory(opts.itemKind)
  if (!category) return undefined
  const city = citySlugFromPlace(opts.tripDestination)
  const filter: GalleryFilter = { category }
  if (city) filter.city = city
  if (category === 'sight' && opts.itemTitle) {
    filter.sightType = guessSightType(opts.itemTitle) as SightType
  }
  return filter
}

export function photoTaxonomyLabel(photo: GalleryPhoto): string {
  const bits = [galleryCityLabel(photo.city), galleryCategoryLabel(photo.category)]
  if (photo.category === 'sight' && photo.sightType) bits.push(sightTypeLabel(photo.sightType))
  return bits.filter(Boolean).join(' · ')
}

export function photoCategoryLabel(photo: GalleryPhoto): string {
  const bits = [galleryCategoryLabel(photo.category)]
  if (photo.category === 'sight' && photo.sightType) bits.push(sightTypeLabel(photo.sightType))
  return bits.filter(Boolean).join(' · ')
}
