import { useEffect, useMemo, useRef } from 'react'
import { galleryMediaSrc } from '../lib/galleryResolve'
import { photoTaxonomyLabel } from '../lib/galleryFilter'
import type { GalleryPhoto } from '../types'

type Props = {
  photos: GalleryPhoto[]
  activeId: string | null
  cityLabel?: string
  onBack: () => void
}

export function GallerySlidePanel({ photos, activeId, cityLabel, onBack }: Props) {
  const track = useRef<HTMLDivElement>(null)

  const activeIndex = useMemo(
    () => (activeId ? photos.findIndex((row) => row.id === activeId) : -1),
    [activeId, photos],
  )

  useEffect(() => {
    if (activeIndex < 0) return
    const el = document.getElementById(`gallery-${photos[activeIndex]?.id}`)
    el?.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' })
  }, [activeIndex, photos])

  useEffect(() => {
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
  }, [photos.length])

  function step(dir: -1 | 1) {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="gallery-page">
      <div className="gallery-tools gallery-slide-tools">
        <button className="btn ghost" type="button" onClick={onBack}>
          돌아가기
        </button>
        {cityLabel ? <span className="gallery-slide-city">{cityLabel}</span> : null}
      </div>
      <button className="gallery-arrow prev" type="button" aria-label="이전 사진" onClick={() => step(-1)}>
        ‹
      </button>
      <div className="gallery-track" ref={track}>
        {photos.map((photo) => (
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
  )
}
