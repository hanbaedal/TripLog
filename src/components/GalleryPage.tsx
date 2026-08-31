import { useEffect, useMemo, useRef, useState } from 'react'
import { PageShell } from './PageShell'
import { listGallery } from '../lib/community'
import { photoTaxonomyLabel } from '../lib/galleryFilter'
import { GALLERY_CATEGORIES, GALLERY_CITIES } from '../data/galleryTaxonomy.js'
import type { GalleryCategory, GalleryPhoto } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  focusId?: string | null
}

type ViewMode = 'list' | 'slide'

export function GalleryPage({ focusId, ...nav }: Props) {
  const track = useRef<HTMLDivElement>(null)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [mode, setMode] = useState<ViewMode>(() => (focusId ? 'slide' : 'list'))
  const [activeId, setActiveId] = useState<string | null>(() => focusId ?? null)
  const [cityFilter, setCityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<GalleryCategory | ''>('')

  useEffect(() => {
    void listGallery().then(setPhotos)
  }, [])

  useEffect(() => {
    if (!focusId) return
    setMode('slide')
    setActiveId(focusId)
  }, [focusId])

  const items = useMemo(() => {
    return photos.filter((photo) => {
      if (cityFilter && photo.city !== cityFilter) return false
      if (categoryFilter && photo.category !== categoryFilter) return false
      return true
    })
  }, [photos, cityFilter, categoryFilter])

  const activeIndex = useMemo(
    () => (activeId ? items.findIndex((row) => row.id === activeId) : -1),
    [activeId, items],
  )

  useEffect(() => {
    if (mode !== 'slide' || activeIndex < 0) return
    const el = document.getElementById(`gallery-${items[activeIndex]?.id}`)
    el?.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' })
  }, [mode, activeIndex, items])

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
  }, [mode, items.length])

  function openSlide(id: string) {
    setActiveId(id)
    setMode('slide')
  }

  function backToList() {
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
            <button
              className="btn ghost"
              type="button"
              onClick={() => (nav.user ? nav.go.galleryWrite() : nav.go.auth())}
            >
              사진 올리기
            </button>
          </div>
          <div className="gallery-list-filters">
            <label>
              도시
              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                <option value="">전체</option>
                {GALLERY_CITIES.map((row) => (
                  <option key={row.slug} value={row.slug}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
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
          <div className="gallery-grid">
            {items.map((photo) => (
              <button
                type="button"
                className="gallery-card"
                key={photo.id}
                onClick={() => openSlide(photo.id)}
              >
                <img src={photo.src} alt={photo.title} loading="lazy" />
                <span>{photo.title}</span>
                <small>{photoTaxonomyLabel(photo)}</small>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <div className="gallery-page">
          <div className="gallery-tools">
            <button className="btn ghost" type="button" onClick={backToList}>
              돌아가기
            </button>
          </div>
          <button className="gallery-arrow prev" type="button" aria-label="이전 사진" onClick={() => step(-1)}>
            ‹
          </button>
          <div className="gallery-track" ref={track}>
            {items.map((photo) => (
              <figure className="gallery-frame" id={`gallery-${photo.id}`} key={photo.id}>
                <img
                  src={photo.src}
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
