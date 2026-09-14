import { GalleryPhoto } from './models.js'
import { FOOD_PHOTOS, GALLERY_PHOTOS } from '../src/data/galleryCatalog.js'
import { normalizeCity, normalizeGalleryCategory, normalizeSightType } from '../src/data/galleryTaxonomy.js'

function catalogMeta(row) {
  return {
    city: normalizeCity(row.city || row.id),
    category: normalizeGalleryCategory(row.category || 'sight'),
    sightType: normalizeSightType(row.sightType || 'town', row.category || 'sight'),
  }
}

async function upsertCatalogPhoto(row) {
  const meta = catalogMeta(row)
  await GalleryPhoto.updateOne(
    { photoId: row.id },
    {
      $set: { title: row.title, ...meta },
      $setOnInsert: {
        photoId: row.id,
        src: row.src,
        catalog: true,
        ownerId: null,
        ownerName: '',
        at: new Date(),
      },
    },
    { upsert: true },
  )
}

export async function seedGallery() {
  for (const row of [...GALLERY_PHOTOS, ...FOOD_PHOTOS]) {
    await upsertCatalogPhoto(row)
  }

  await GalleryPhoto.deleteMany({ photoId: /^spot-/ })
}
