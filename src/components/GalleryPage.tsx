import { useEffect, useMemo, useRef, useState } from 'react'
import { PageShell } from './PageShell'
import { listGallery } from '../lib/community'
import type { GalleryPhoto } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  focusId?: string | null
}

export function GalleryPage({ focusId, ...nav }: Props) {
  const track = useRef<HTMLDivElement>(null)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])

  useEffect(() => {
    void listGallery().then(setPhotos)
  }, [])

  const items = useMemo(() => photos, [photos])

  useEffect(() => {
    if (!focusId) return
    const el = document.getElementById(`gallery-${focusId}`)
    el?.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' })
  }, [focusId, items])

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
  }, [])

  function step(dir: -1 | 1) {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <PageShell {...nav} wide>
      <div className="gallery-page">
        <div className="gallery-tools">
          <button
            className="btn ghost"
            type="button"
            onClick={() => (nav.user ? nav.go.galleryWrite() : nav.go.auth())}
          >
            사진 올리기
          </button>
        </div>
        <button className="gallery-arrow prev" type="button" aria-label="이전 사진" onClick={() => step(-1)}>
          ‹
        </button>
        <div className="gallery-track" ref={track}>
          {items.map((photo) => (
            <figure className="gallery-frame" id={`gallery-${photo.id}`} key={photo.id}>
              <img src={photo.src} alt={photo.title} loading={photo.id === focusId ? 'eager' : 'lazy'} />
              <figcaption>{photo.title}</figcaption>
            </figure>
          ))}
        </div>
        <button className="gallery-arrow next" type="button" aria-label="다음 사진" onClick={() => step(1)}>
          ›
        </button>
      </div>
    </PageShell>
  )
}
