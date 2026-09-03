import { TaxonomyOption } from './models.js'
import {
  FOOD_TYPES,
  GALLERY_CATEGORIES,
  GALLERY_CITIES,
  SIGHT_TYPES,
} from '../src/data/galleryTaxonomy.js'

const SEED = [
  ...GALLERY_CITIES.map((row, index) => ({ kind: 'city', slug: row.slug, label: row.label, sort: index + 1 })),
  ...GALLERY_CATEGORIES.map((row, index) => ({ kind: 'category', slug: row.slug, label: row.label, sort: index + 1 })),
  ...SIGHT_TYPES.map((row, index) => ({ kind: 'sightType', slug: row.slug, label: row.label, sort: index + 1 })),
  ...FOOD_TYPES.map((row, index) => ({ kind: 'foodType', slug: row.slug, label: row.label, sort: index + 1 })),
]

export async function seedTaxonomy() {
  await TaxonomyOption.deleteMany({ slug: 'other' })

  for (const row of SEED) {
    await TaxonomyOption.updateOne(
      { kind: row.kind, slug: row.slug },
      { $set: { label: row.label, sort: row.sort }, $setOnInsert: { kind: row.kind, slug: row.slug } },
      { upsert: true },
    )
  }
}
