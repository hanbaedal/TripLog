import { GalleryPhoto } from './models.js'
import { GALLERY_PHOTOS, cityGalleryId } from '../src/data/galleryCatalog.js'
import { TRAVEL_SPOT_CATALOG } from '../src/data/travelSpotCatalog.js'
import { guessSightType, normalizeCity, normalizeGalleryCategory, normalizeSightType } from '../src/data/galleryTaxonomy.js'

function catalogMeta(row) {
  return {
    city: normalizeCity(row.city || row.id),
    category: normalizeGalleryCategory(row.category || 'sight'),
    sightType: normalizeSightType(row.sightType || 'other', row.category || 'sight'),
  }
}

export async function seedGallery() {
  const srcById = new Map(GALLERY_PHOTOS.map((row) => [row.id, row.src]))

  for (const row of GALLERY_PHOTOS) {
    const meta = catalogMeta(row)
    await GalleryPhoto.updateOne(
      { photoId: row.id },
      {
        $set: {
          title: row.title,
          src: row.src,
          catalog: true,
          ownerName: '',
          ...meta,
        },
        $setOnInsert: {
          photoId: row.id,
          ownerId: null,
          at: new Date(),
        },
      },
      { upsert: true },
    )
  }

  for (const spot of TRAVEL_SPOT_CATALOG) {
    const city = normalizeCity(cityGalleryId(spot.cityId))
    const src = srcById.get(city) || ''
    if (!src) continue
    const category = 'sight'
    const sightType = normalizeSightType(guessSightType(spot.name), category)
    await GalleryPhoto.updateOne(
      { photoId: spot.id },
      {
        $set: {
          title: spot.name,
          src,
          catalog: true,
          ownerName: '',
          city,
          category,
          sightType,
        },
        $setOnInsert: {
          photoId: spot.id,
          ownerId: null,
          at: new Date(),
        },
      },
      { upsert: true },
    )
  }
}
