import { useEffect, useState } from 'react'
import type { GalleryCategory, SightType } from '../types'
import { GALLERY_CATEGORIES, GALLERY_CITIES, SIGHT_TYPES } from '../data/galleryTaxonomy.js'
import { loadTaxonomy, type TaxonomyBundle } from '../lib/taxonomy'

type Props = {
  city: string
  category: GalleryCategory | ''
  sightType: SightType | ''
  onCity: (value: string) => void
  onCategory: (value: GalleryCategory | '') => void
  onSightType: (value: SightType | '') => void
  disabled?: boolean
}

export function GalleryTaxonomyFields({
  city,
  category,
  sightType,
  onCity,
  onCategory,
  onSightType,
  disabled,
}: Props) {
  const [taxonomy, setTaxonomy] = useState<TaxonomyBundle | null>(null)

  useEffect(() => {
    void loadTaxonomy().then(setTaxonomy)
  }, [])

  const cities = taxonomy?.cities ?? GALLERY_CITIES
  const categories = taxonomy?.categories ?? GALLERY_CATEGORIES
  const sightTypes = taxonomy?.sightTypes ?? SIGHT_TYPES

  return (
    <>
      <label>
        도시
        <select value={city} onChange={(e) => onCity(e.target.value)} required disabled={disabled}>
          <option value="">선택</option>
          {cities.map((row) => (
            <option key={row.slug} value={row.slug}>
              {row.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        분류
        <select
          value={category}
          onChange={(e) => onCategory(e.target.value as GalleryCategory | '')}
          required
          disabled={disabled}
        >
          <option value="">선택</option>
          {categories.map((row) => (
            <option key={row.slug} value={row.slug}>
              {row.label}
            </option>
          ))}
        </select>
      </label>
      {category === 'sight' ? (
        <label>
          관광 유형
          <select
            value={sightType}
            onChange={(e) => onSightType(e.target.value as SightType | '')}
            disabled={disabled}
          >
            <option value="">선택(선택)</option>
            {sightTypes.map((row) => (
              <option key={row.slug} value={row.slug}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  )
}
