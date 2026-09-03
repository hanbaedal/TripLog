import {
  FOOD_TYPES,
  GALLERY_CATEGORIES,
  GALLERY_CITIES,
  SIGHT_TYPES,
} from '../data/galleryTaxonomy.js'
import { api, isRemote } from './remote'

export type TaxonomyKind = 'city' | 'category' | 'sightType' | 'foodType'

export type TaxonomyRow = { slug: string; label: string; sort?: number }

export type TaxonomyBundle = {
  cities: TaxonomyRow[]
  categories: TaxonomyRow[]
  sightTypes: TaxonomyRow[]
  foodTypes: TaxonomyRow[]
}

const FALLBACK: TaxonomyBundle = {
  cities: GALLERY_CITIES.map((row, index) => ({ slug: row.slug, label: row.label, sort: index + 1 })),
  categories: GALLERY_CATEGORIES.map((row, index) => ({ slug: row.slug, label: row.label, sort: index + 1 })),
  sightTypes: SIGHT_TYPES.map((row, index) => ({ slug: row.slug, label: row.label, sort: index + 1 })),
  foodTypes: FOOD_TYPES.map((row, index) => ({ slug: row.slug, label: row.label, sort: index + 1 })),
}

let cache: TaxonomyBundle | null = null

export function invalidateTaxonomyCache() {
  cache = null
}

export async function loadTaxonomy(): Promise<TaxonomyBundle> {
  if (cache) return cache
  if (isRemote()) {
    try {
      const data = await api<TaxonomyBundle>('/taxonomy')
      cache = {
        cities: data.cities || [],
        categories: data.categories || [],
        sightTypes: data.sightTypes || [],
        foodTypes: data.foodTypes || [],
      }
      return cache
    } catch {
      cache = FALLBACK
      return cache
    }
  }
  cache = FALLBACK
  return cache
}

export function nextTaxonomySort(rows: TaxonomyRow[]): number {
  const max = rows.reduce((top, row) => Math.max(top, row.sort ?? 0), 0)
  return max + 1
}

export async function saveTaxonomyRow(input: {
  kind: TaxonomyKind
  slug: string
  label: string
  sort?: number
  prevSlug?: string
}): Promise<TaxonomyBundle> {
  if (!isRemote()) throw new Error('분류 관리는 서버 연결 시에만 가능합니다.')
  if (input.prevSlug) {
    cache = await api<TaxonomyBundle>(`/taxonomy/${input.kind}/${input.prevSlug}`, {
      method: 'PUT',
      body: JSON.stringify({ slug: input.slug, label: input.label, sort: input.sort ?? 99 }),
    })
  } else {
    cache = await api<TaxonomyBundle>('/taxonomy', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }
  invalidateTaxonomyCache()
  cache = await loadTaxonomy()
  return cache
}

export async function removeTaxonomyRow(kind: TaxonomyKind, slug: string): Promise<TaxonomyBundle> {
  if (!isRemote()) throw new Error('분류 관리는 서버 연결 시에만 가능합니다.')
  cache = await api<TaxonomyBundle>(`/taxonomy/${kind}/${slug}`, { method: 'DELETE' })
  invalidateTaxonomyCache()
  cache = await loadTaxonomy()
  return cache
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
