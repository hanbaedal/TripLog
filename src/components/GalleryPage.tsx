import { useEffect, useMemo, useRef, useState } from 'react'
import { PageShell } from './PageShell'
import { listGallery, canEditGallery } from '../lib/community'
import { galleryMediaSrc } from '../lib/galleryResolve'
import { isSupervisor } from '../lib/auth'
import { galleryCityLabel, photoCategoryLabel, photoTaxonomyLabel } from '../lib/galleryFilter'
import { GALLERY_CATEGORIES, GALLERY_CITIES } from '../data/galleryTaxonomy.js'
import { KR_GALLERY_CITIES } from '../data/krGalleryCatalog.js'
import { galleryPhotoMarket } from '../lib/market'
import { loadTaxonomy, type TaxonomyRow } from '../lib/taxonomy'
import type { GalleryCategory, GalleryPhoto } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  focusId?: string | null
}

type ViewMode = 'list' | 'slide'

type CityGroup = {
  slug: string
  label: string
  photos: GalleryPhoto[]
}

export function GalleryPage({ focusId, ...nav }: Props) {
  const track = useRef<HTMLDivElement>(null)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [mode, setMode] = useState<ViewMode>(() => (focusId ? 'slide' : 'list'))
  const [activeId, setActiveId] = useState<string | null>(() => focusId ?? null)
  const [slideCity, setSlideCity] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<GalleryCategory | ''>('')
  const citySource = nav.market === 'kr' ? KR_GALLERY_CITIES : GALLERY_CITIES
  const [cities, setCities] = useState<TaxonomyRow[]>(
    citySource.map((row, index) => ({
      slug: row.slug,
      label: row.label,
      labelZh: 'labelZh' in row && typeof row.labelZh === 'string' ? row.labelZh : '',
      sort: index + 1,
    })),
  )

  const supervisor = isSupervisor(nav.user)

  useEffect(() => {
    void listGallery(nav.market).then(setPhotos)
    if (nav.market === 'cn') {
      void loadTaxonomy().then((bundle) => {
        if (bundle.cities.length) setCities(bundle.cities)
      })
    } else {
      setCities(
        KR_GALLERY_CITIES.map((row, index) => ({
          slug: row.slug,
          label: row.label,
          labelZh: '',
          sort: index + 1,
        })),
      )
    }
  }, [nav.market])

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
      groups.push({
        slug: city.slug,
        label: city.label,
        photos: rows,
      })
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

  const activeIndex = useMemo(
    () => (activeId ? slideItems.findIndex((row) => row.id === activeId) : -1),
    [activeId, slideItems],
  )

  useEffect(() => {
    if (mode !== 'slide' || activeIndex < 0) return
    const el = document.getElementById(`gallery-${slideItems[activeIndex]?.id}`)
    el?.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' })
  }, [mode, activeIndex, slideItems])

  useEffect(() => {
    if (mode !== 'slide') return
    const node = track.current
    if (!node) return
    const scroller = node
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      scroller.scrollBy({ left: e.deltaY, behavior: 'auto' })
    }
    scroller.addEventListener('wheel', onWheel, { passive: false })
    return () => scroller.removeEventListener('wheel', onWheel)
  }, [mode, slideItems.length])

  function openSlide(id: string, city?: string) {
    setSlideCity(city || photos.find((row) => row.id === id)?.city || '')
    setActiveId(id)
    setMode('slide')
  }

  function backToList() {
    setSlideCity('')
    setMode('list')
  }

  function step(dir: -1 | 1) {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <PageShell {...nav} wide={mode === 'slide'}>
      {mode === 'list' ? (
        <section className="wrap section gallery-list-page">
          <div className="section-head">
            <h2>갤러리</h2>
            <div className="nav-actions">
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
                {GALLERY_CATEGORIES.map((row) => (
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
              <div className="gallery-grid">
                {group.photos.map((photo) => (
                  <article className="gallery-card-cell" key={photo.id}>
                    <button
                      type="button"
                      className="gallery-card"
                      onClick={() => openSlide(photo.id, group.slug)}
                    >
                      <div className="gallery-card-thumb">
                        <img src={galleryMediaSrc(photo.src)} alt={photo.title} loading="lazy" />
                      </div>
                      <span>{photo.title}</span>
                      <small>{photoCategoryLabel(photo)}</small>
                    </button>
                    {canEditGallery(photo, nav.user) ? (
                      <button
                        className="btn ghost gallery-card-edit"
                        type="button"
                        onClick={() => {
                          if (supervisor && photo.catalog) nav.go.catalog(photo.id)
                          else nav.go.galleryWrite(photo.id)
                        }}
                      >
                        수정
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="gallery-page">
          <div className="gallery-tools gallery-slide-tools">
            <button className="btn ghost" type="button" onClick={backToList}>
              돌아가기
            </button>
            {slideCity ? (
              <span className="gallery-slide-city">
                {cities.find((row) => row.slug === slideCity)?.label || galleryCityLabel(slideCity)}
              </span>
            ) : null}
          </div>
          <button className="gallery-arrow prev" type="button" aria-label="이전 사진" onClick={() => step(-1)}>
            ‹
          </button>
          <div className="gallery-track" ref={track}>
            {slideItems.map((photo) => (
              <figure className="gallery-frame" id={`gallery-${photo.id}`} key={photo.id}>
                <img
                  src={galleryMediaSrc(photo.src)}
                  alt={photo.title}
                  loading={photo.id === activeId ? 'eager' : 'lazy'}
                />
                <figcaption>
                  {photo.title}
                  <br />
                  <small>{photoTaxonomyLabel(photo)}</small>
                </figcaption>
              </figure>
            ))}
          </div>
          <button className="gallery-arrow next" type="button" aria-label="다음 사진" onClick={() => step(1)}>
            ›
          </button>
        </div>
      )}
    </PageShell>
  )
}
