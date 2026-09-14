import {
  FOOD_TYPES,
  GALLERY_CATEGORIES,
  GALLERY_CITIES,
  KR_FOOD_TYPES,
  SIGHT_TYPES,
} from '../data/galleryTaxonomy.js'
import { KR_GALLERY_CITIES } from '../data/krGalleryCatalog.js'
import type { Market } from '../types'
import { api } from './remote'

export type TaxonomyKind = 'city' | 'category' | 'sightType' | 'foodType'

export type TaxonomyRow = { slug: string; label: string; labelZh?: string; sort?: number }

export type TaxonomyBundle = {
  cities: TaxonomyRow[]
  categories: TaxonomyRow[]
  sightTypes: TaxonomyRow[]
  foodTypes: TaxonomyRow[]
}

function fallbackFor(market: Market): TaxonomyBundle {
  if (market === 'kr') {
    return {
      cities: KR_GALLERY_CITIES.map((row, index) => ({
        slug: row.slug,
        label: row.label,
        labelZh: '',
        sort: index + 1,
      })),
      categories: GALLERY_CATEGORIES.map((row, index) => ({
        slug: row.slug,
        label: row.label,
        labelZh: row.labelZh || '',
        sort: index + 1,
      })),
      sightTypes: SIGHT_TYPES.map((row, index) => ({
        slug: row.slug,
        label: row.label,
        labelZh: row.labelZh || '',
        sort: index + 1,
      })),
      foodTypes: KR_FOOD_TYPES.map((row, index) => ({
        slug: row.slug,
        label: row.label,
        labelZh: '',
        sort: index + 1,
      })),
    }
  }

  return {
    cities: GALLERY_CITIES.map((row, index) => ({
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh || '',
      sort: index + 1,
    })),
    categories: GALLERY_CATEGORIES.map((row, index) => ({
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh || '',
      sort: index + 1,
    })),
    sightTypes: SIGHT_TYPES.map((row, index) => ({
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh || '',
      sort: index + 1,
    })),
    foodTypes: FOOD_TYPES.map((row, index) => ({
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh || '',
      sort: index + 1,
    })),
  }
}

const cache = new Map<Market, TaxonomyBundle>()

export function invalidateTaxonomyCache(market?: Market) {
  if (market) cache.delete(market)
  else cache.clear()
}

export async function loadTaxonomy(market: Market = 'cn'): Promise<TaxonomyBundle> {
  const cached = cache.get(market)
  if (cached) return cached
  try {
    const data = await api<TaxonomyBundle>(`/taxonomy?market=${market}`)
    const bundle = {
      cities: data.cities || [],
      categories: data.categories || [],
      sightTypes: data.sightTypes || [],
      foodTypes: data.foodTypes || [],
    }
    cache.set(market, bundle)
    return bundle
  } catch {
    const fallback = fallbackFor(market)
    cache.set(market, fallback)
    return fallback
  }
}

export function nextTaxonomySort(rows: TaxonomyRow[]): number {
  const max = rows.reduce((top, row) => Math.max(top, row.sort ?? 0), 0)
  return max + 1
}

function marketQuery(market: Market) {
  return `market=${market}`
}

export async function saveTaxonomyRow(input: {
  market: Market
  kind: TaxonomyKind
  slug: string
  label: string
  labelZh?: string
  sort?: number
  prevSlug?: string
}): Promise<TaxonomyBundle> {
  const body = {
    market: input.market,
    kind: input.kind,
    slug: input.slug,
    label: input.label,
    labelZh: input.labelZh || '',
    sort: input.sort ?? 99,
  }
  if (input.prevSlug) {
    await api<TaxonomyBundle>(`/taxonomy/${input.kind}/${input.prevSlug}?${marketQuery(input.market)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  } else {
    await api<TaxonomyBundle>('/taxonomy', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
  invalidateTaxonomyCache(input.market)
  return loadTaxonomy(input.market)
}

export async function removeTaxonomyRow(
  market: Market,
  kind: TaxonomyKind,
  slug: string,
): Promise<TaxonomyBundle> {
  await api<TaxonomyBundle>(`/taxonomy/${kind}/${slug}?${marketQuery(market)}`, { method: 'DELETE' })
  invalidateTaxonomyCache(market)
  return loadTaxonomy(market)
}

export function taxonomyCityLabel(bundle: TaxonomyBundle, slug?: string): string {
  return bundle.cities.find((row) => row.slug === slug)?.label || slug || ''
}

export function taxonomyCategoryLabel(bundle: TaxonomyBundle, slug?: string): string {
  return bundle.categories.find((row) => row.slug === slug)?.label || slug || ''
}

export function taxonomyFoodTypeLabel(bundle: TaxonomyBundle, slug?: string): string {
  return bundle.foodTypes.find((row) => row.slug === slug)?.label || slug || ''
}
