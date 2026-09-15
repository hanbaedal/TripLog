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
  category?: GalleryCategory | ItemKind
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
  if (filter.city && row.city !== filter.city) return false
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

/** 제목이 도시명과 같으면 권역 대표 카드(서울·강원 등) */
export function photoTitleDuplicatesCity(photo: GalleryPhoto): boolean {
  const city = galleryCityLabel(photo.city)
  return Boolean(city && photo.title.trim() === city.trim())
}

/** 카탈로그·관리 카드 — 제목·분류 중복 없이 한 줄 표시용 */
export function photoManageCardDisplay(photo: GalleryPhoto): { title: string | null; taxonomy: string } {
  const taxonomy = photoTaxonomyLabel(photo)
  if (photoTitleDuplicatesCity(photo)) {
    return { title: null, taxonomy }
  }
  return { title: photo.title, taxonomy }
}

export function photoCategoryLabel(photo: GalleryPhoto): string {
  const category = normalizeGalleryCategory(photo.category || 'sight')
  const bits = [galleryCategoryLabel(category)]
  if (category === 'sight') {
    const sight =
      photo.sightType ||
      normalizeSightType(guessSightType(photo.title), category)
    if (sight) bits.push(sightTypeLabel(sight))
  }
  return bits.filter(Boolean).join(' · ')
}
