import { useEffect, useState } from 'react'
import type { GalleryCategory, SightType } from '../types'
import { loadTaxonomy, type TaxonomyBundle } from '../lib/taxonomy'
import type { Market } from '../types'

type Props = {
  market?: Market
  city: string
  category: GalleryCategory | ''
  sightType: SightType | ''
  onCity: (value: string) => void
  onCategory: (value: GalleryCategory | '') => void
  onSightType: (value: SightType | '') => void
  disabled?: boolean
  compact?: boolean
}

export function GalleryTaxonomyFields({
  market = 'cn',
  city,
  category,
  sightType,
  onCity,
  onCategory,
  onSightType,
  disabled,
  compact = false,
}: Props) {
  const [taxonomy, setTaxonomy] = useState<TaxonomyBundle | null>(null)

  useEffect(() => {
    void loadTaxonomy(market).then(setTaxonomy)
  }, [market])

  const cities = taxonomy?.cities ?? []
  const categories = taxonomy?.categories ?? []
  const sightTypes = taxonomy?.sightTypes ?? []

  return (
    <div className={compact ? 'gallery-taxonomy-compact' : 'gallery-taxonomy-stack'}>
      <div className="gallery-taxonomy-row">
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
      </div>
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
    </div>
  )
}
