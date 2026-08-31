import {
  normalizeCity,
  normalizeGalleryCategory,
  normalizeSightType,
} from '../../src/data/galleryTaxonomy.js'

export function parseGalleryMeta(body) {
  const category = normalizeGalleryCategory(body?.category)
  const city = normalizeCity(body?.city)
  const sightType = normalizeSightType(body?.sightType, category)
  return { city, category, sightType }
}
