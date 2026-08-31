import { GalleryPhoto } from './models.js'
import { GALLERY_PHOTOS } from '../src/data/galleryCatalog.js'
import { TRAVEL_SPOT_CATALOG } from '../src/data/travelSpotCatalog.js'
import { cityGalleryId } from '../src/data/galleryCatalog.js'

export async function seedGallery() {
  const srcById = new Map(GALLERY_PHOTOS.map((row) => [row.id, row.src]))

  for (const row of GALLERY_PHOTOS) {
    await GalleryPhoto.updateOne(
      { photoId: row.id },
      {
        $setOnInsert: {
          photoId: row.id,
          title: row.title,
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

  for (const spot of TRAVEL_SPOT_CATALOG) {
    const cityId = cityGalleryId(spot.cityId)
    const src = srcById.get(cityId) || ''
    if (!src) continue
    await GalleryPhoto.updateOne(
      { photoId: spot.id },
      {
        $setOnInsert: {
          photoId: spot.id,
          title: spot.name,
          src,
          catalog: true,
          ownerId: null,
          ownerName: '',
          at: new Date(),
        },
      },
      { upsert: true },
    )
  }
}
