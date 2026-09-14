import { TaxonomyOption } from './models.js'
import {
  FOOD_TYPES,
  GALLERY_CATEGORIES,
  GALLERY_CITIES,
  KR_FOOD_TYPES,
  SIGHT_TYPES,
} from '../src/data/galleryTaxonomy.js'
import { KR_GALLERY_CITIES } from '../src/data/krGalleryCatalog.js'

function rowsForMarket(market) {
  if (market === 'kr') {
    return [
      ...KR_GALLERY_CITIES.map((row, index) => ({
        market: 'kr',
        kind: 'city',
        slug: row.slug,
        label: row.label,
        labelZh: '',
        sort: index + 1,
      })),
      ...GALLERY_CATEGORIES.map((row, index) => ({
        market: 'kr',
        kind: 'category',
        slug: row.slug,
        label: row.label,
        labelZh: row.labelZh || '',
        sort: index + 1,
      })),
      ...SIGHT_TYPES.map((row, index) => ({
        market: 'kr',
        kind: 'sightType',
        slug: row.slug,
        label: row.label,
        labelZh: row.labelZh || '',
        sort: index + 1,
      })),
      ...KR_FOOD_TYPES.map((row, index) => ({
        market: 'kr',
        kind: 'foodType',
        slug: row.slug,
        label: row.label,
        labelZh: '',
        sort: index + 1,
      })),
    ]
  }

  return [
    ...GALLERY_CITIES.map((row, index) => ({
      market: 'cn',
      kind: 'city',
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh || '',
      sort: index + 1,
    })),
    ...GALLERY_CATEGORIES.map((row, index) => ({
      market: 'cn',
      kind: 'category',
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh || '',
      sort: index + 1,
    })),
    ...SIGHT_TYPES.map((row, index) => ({
      market: 'cn',
      kind: 'sightType',
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh || '',
      sort: index + 1,
    })),
    ...FOOD_TYPES.map((row, index) => ({
      market: 'cn',
      kind: 'foodType',
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh || '',
      sort: index + 1,
    })),
  ]
}

async function migrateTaxonomyMarket() {
  await TaxonomyOption.updateMany({ market: { $exists: false } }, { $set: { market: 'cn' } })

  const indexes = await TaxonomyOption.collection.indexes()
  const legacy = indexes.find((row) => row.key?.kind === 1 && row.key?.slug === 1 && !row.key?.market)
  if (legacy?.name) {
    try {
      await TaxonomyOption.collection.dropIndex(legacy.name)
    } catch {
      /* already dropped */
    }
  }

  await TaxonomyOption.syncIndexes()
}

export async function seedTaxonomy() {
  await migrateTaxonomyMarket()
  await TaxonomyOption.deleteMany({ slug: 'other' })

  for (const market of ['cn', 'kr']) {
    for (const row of rowsForMarket(market)) {
      await TaxonomyOption.updateOne(
        { market: row.market, kind: row.kind, slug: row.slug },
        {
          $set: {
            label: row.label,
            labelZh: row.labelZh || '',
            sort: row.sort,
          },
          $setOnInsert: {
            market: row.market,
            kind: row.kind,
            slug: row.slug,
          },
        },
        { upsert: true },
      )
    }
  }
}
