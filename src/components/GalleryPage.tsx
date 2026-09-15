import { useEffect, useMemo, useState } from 'react'
import { PageShell } from './PageShell'
import { GalleryEditModal } from './GalleryEditModal'
import { GalleryManageCardList } from './GalleryManageCardList'
import { GallerySlidePanel } from './GallerySlidePanel'
import { listGallery, canEditGallery, removeGalleryPhoto } from '../lib/community'
import { isSupervisor } from '../lib/auth'
import { galleryCityLabel } from '../lib/galleryFilter'
import { galleryPhotoMarket } from '../lib/market'
import { loadTaxonomy, type TaxonomyRow } from '../lib/taxonomy'
import type { GalleryCategory, GalleryPhoto } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  focusId?: string | null
  returnToHome?: boolean
}

type ViewMode = 'list' | 'slide'

type CityGroup = {
  slug: string
  label: string
  photos: GalleryPhoto[]
}

export function GalleryPage({ focusId, returnToHome = false, ...nav }: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [mode, setMode] = useState<ViewMode>(() => (focusId ? 'slide' : 'list'))
  const [activeId, setActiveId] = useState<string | null>(() => focusId ?? null)
  const [slideCity, setSlideCity] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<GalleryCategory | ''>('')
  const [cities, setCities] = useState<TaxonomyRow[]>([])
  const [categories, setCategories] = useState<TaxonomyRow[]>([])
  const [editing, setEditing] = useState<GalleryPhoto | null>(null)

  const supervisor = isSupervisor(nav.user)

  useEffect(() => {
    void refreshPhotos()
    void loadTaxonomy(nav.market).then((bundle) => {
      if (bundle.cities.length) setCities(bundle.cities)
      if (bundle.categories.length) setCategories(bundle.categories)
    })
  }, [nav.market])

  async function refreshPhotos() {
    setPhotos(await listGallery(nav.market))
  }

  useEffect(() => {
    if (!focusId) return
    const photo = photos.find((row) => row.id === focusId)
    setSlideCity(photo?.city || '')
    setMode('slide')
    setActiveId(focusId)
  }, [focusId, photos])

  const filtered = useMemo(() => {
    return photos.filter((photo) => {
      if (galleryPhotoMarket(photo) !== nav.market) return false
      if (categoryFilter && photo.category !== categoryFilter) return false
      return true
    })
  }, [photos, categoryFilter, nav.market])

  const cityGroups = useMemo((): CityGroup[] => {
    const buckets = new Map<string, GalleryPhoto[]>()
    for (const photo of filtered) {
      const slug = photo.city || 'dalian'
      const list = buckets.get(slug) || []
      list.push(photo)
      buckets.set(slug, list)
    }

    const groups: CityGroup[] = []
    for (const city of cities) {
      const rows = buckets.get(city.slug)
      if (!rows?.length) continue
      groups.push({ slug: city.slug, label: city.label, photos: rows })
      buckets.delete(city.slug)
    }

    for (const [slug, rows] of buckets) {
      if (!rows.length) continue
      groups.push({
        slug,
        label: galleryCityLabel(slug) || slug,
        photos: rows,
      })
    }

    return groups
  }, [filtered, cities])

  const slideItems = useMemo(() => {
    if (!slideCity) return filtered
    return filtered.filter((photo) => (photo.city || 'dalian') === slideCity)
  }, [filtered, slideCity])

  function openSlide(id: string, city?: string) {
    setSlideCity(city || photos.find((row) => row.id === id)?.city || '')
    setActiveId(id)
    setMode('slide')
  }

  function backFromSlide() {
    if (returnToHome) {
      nav.go.home()
      return
    }
    setSlideCity('')
    setMode('list')
    setActiveId(null)
  }

  function startEdit(photo: GalleryPhoto) {
    if (!nav.user || !canEditGallery(photo, nav.user)) return
    setEditing(photo)
  }

  async function removePhoto(id: string) {
    if (!window.confirm('이 사진을 삭제할까요?')) return
    await removeGalleryPhoto(id)
    await refreshPhotos()
    if (activeId === id) backFromSlide()
  }

  const slideCityLabel =
    cities.find((row) => row.slug === slideCity)?.label || galleryCityLabel(slideCity) || ''

  return (
    <PageShell {...nav} wide={mode === 'slide'}>
      {mode === 'slide' ? (
        <GallerySlidePanel
          photos={slideItems}
          activeId={activeId}
          cityLabel={slideCityLabel}
          onBack={backFromSlide}
        />
      ) : (
        <section className="wrap section gallery-list-page">
          <div className="section-head">
            <h2>갤러리</h2>
            <div className="nav-actions">
              {supervisor ? (
                <button className="btn ghost" type="button" onClick={() => nav.go.catalog()}>
                  카탈로그
                </button>
              ) : null}
              {nav.user ? (
                <button className="btn ghost" type="button" onClick={() => nav.go.galleryWrite()}>
                  사진 올리기
                </button>
              ) : null}
            </div>
          </div>
          <div className="gallery-list-filters">
            <label>
              분류
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as GalleryCategory | '')}
              >
                <option value="">전체</option>
                {categories.map((row) => (
                  <option key={row.slug} value={row.slug}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {cityGroups.map((group) => (
            <div className="gallery-city-group" key={group.slug}>
              <div className="section-head gallery-city-head">
                <h3>{group.label}</h3>
                <span className="muted">{group.photos.length}장</span>
              </div>
              <GalleryManageCardList
                photos={group.photos}
                allowCatalogDelete={supervisor}
                canManage={(photo) => canEditGallery(photo, nav.user)}
                onOpen={(photo) => openSlide(photo.id, group.slug)}
                onEdit={startEdit}
                onRemove={removePhoto}
              />
            </div>
          ))}
        </section>
      )}

      {editing && nav.user ? (
        <GalleryEditModal
          photo={editing}
          photos={photos}
          user={nav.user}
          market={nav.market}
          catalogMode={Boolean(editing.catalog && supervisor)}
          onClose={() => setEditing(null)}
          onSaved={() => void refreshPhotos()}
        />
      ) : null}
    </PageShell>
  )
}
