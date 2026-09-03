import {
  GALLERY_CATEGORIES,
  GALLERY_CITIES,
  SIGHT_TYPES,
} from '../data/galleryTaxonomy.js'
import { api, isRemote } from './remote'

export type TaxonomyRow = { slug: string; label: string; sort?: number }

export type TaxonomyBundle = {
  cities: TaxonomyRow[]
  categories: TaxonomyRow[]
  sightTypes: TaxonomyRow[]
}

const FALLBACK: TaxonomyBundle = {
  cities: GALLERY_CITIES.map((row) => ({ slug: row.slug, label: row.label })),
  categories: GALLERY_CATEGORIES.map((row) => ({ slug: row.slug, label: row.label })),
  sightTypes: SIGHT_TYPES.map((row) => ({ slug: row.slug, label: row.label })),
}

let cache: TaxonomyBundle | null = null

export function invalidateTaxonomyCache() {
  cache = null
}

export async function loadTaxonomy(): Promise<TaxonomyBundle> {
  if (cache) return cache
  if (isRemote()) {
    try {
      cache = await api<TaxonomyBundle>('/taxonomy')
      return cache
    } catch {
      cache = FALLBACK
      return cache
    }
  }
  cache = FALLBACK
  return cache
}

export async function saveTaxonomyRow(input: {
  kind: 'city' | 'category' | 'sightType'
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

export async function removeTaxonomyRow(
  kind: 'city' | 'category' | 'sightType',
  slug: string,
): Promise<TaxonomyBundle> {
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
