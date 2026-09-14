import { useEffect, useMemo, useRef, useState } from 'react'
import type { SampleRecord, GalleryPhoto } from '../types'
import { sampleCover } from '../data/sampleCovers'
import { nightsLabel } from '../data/samples'
import { loadGalleryPhotos } from '../lib/galleryResolve'

type Props = {
  items: SampleRecord[]
  auto?: boolean
  supervisor?: boolean
  onPick: (sample: SampleRecord) => void
  onEdit?: (sample: SampleRecord) => void
  onDelete?: (id: string) => void
}

const GAP = 12

export function SampleSlider({ items, auto, supervisor, onPick, onEdit, onDelete }: Props) {
  const track = useRef<HTMLDivElement>(null)
  const loopWidth = useRef(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])

  const infinite = items.length > 1
  const loopItems = useMemo(
    () => (infinite ? [...items, ...items] : items),
    [infinite, items],
  )

  useEffect(() => {
    void loadGalleryPhotos().then(setPhotos)
  }, [])

  function measureLoop() {
    const el = track.current
    if (!el || !infinite) {
      loopWidth.current = 0
      return
    }
    loopWidth.current = el.scrollWidth / 2
  }

  function wrapScroll() {
    const el = track.current
    const loop = loopWidth.current
    if (!el || !infinite || loop <= 0) return
    if (el.scrollLeft >= loop) el.scrollLeft -= loop
    else if (el.scrollLeft < 0) el.scrollLeft += loop
  }

  function updateArrows() {
    if (infinite) {
      setCanPrev(true)
      setCanNext(true)
      return
    }
    const el = track.current
    if (!el) return
    setCanPrev(el.scrollLeft > 12)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 12)
  }

  useEffect(() => {
    const el = track.current
    if (!el) return
    el.scrollLeft = 0
    measureLoop()
    updateArrows()

    function onScroll() {
      wrapScroll()
      updateArrows()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => {
      measureLoop()
      wrapScroll()
      updateArrows()
    })
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [items, infinite])

  useEffect(() => {
    if (!auto || !infinite) return
    const timer = window.setInterval(() => {
      const el = track.current
      if (!el) return
      const card = el.querySelector<HTMLElement>('.sample-card')
      const step = card ? card.offsetWidth + GAP : 240
      el.scrollBy({ left: step, behavior: 'smooth' })
    }, 3800)
    return () => window.clearInterval(timer)
  }, [auto, infinite])

  function scroll(dir: -1 | 1) {
    const el = track.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.sample-card')
    const step = card ? card.offsetWidth + GAP : el.clientWidth * 0.8
    if (infinite && dir === -1 && el.scrollLeft <= 12 && loopWidth.current > 0) {
      el.scrollLeft = loopWidth.current
    }
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  function renderCard(sample: SampleRecord, key: string) {
    return (
      <article className="sample-card" key={key}>
        <button type="button" className="sample-card-main" onClick={() => onPick(sample)}>
          <span className="sample-card-duration">{nightsLabel(sample.nights)}</span>
          <img className="sample-card-photo" src={sampleCover(sample, photos)} alt="" />
          <span className="sample-card-label">
            <h3>{sample.place}</h3>
          </span>
        </button>
        {supervisor && onEdit && onDelete ? (
          <div className="sample-card-actions">
            <button className="btn ghost" type="button" onClick={() => onEdit(sample)}>
              수정
            </button>
            <button className="btn ghost" type="button" onClick={() => onDelete(sample.id)}>
              삭제
            </button>
          </div>
        ) : null}
      </article>
    )
  }

  if (!items.length) return null

  return (
    <div className="sample-slider">
      <button
        className={`sample-slider-btn prev${canPrev ? '' : ' is-off'}`}
        type="button"
        aria-label="이전"
        disabled={!canPrev}
        onClick={() => scroll(-1)}
      >
        ‹
      </button>
      <div className={`sample-slider-track${infinite ? ' is-infinite' : ''}`} ref={track}>
        {loopItems.map((sample, index) =>
          renderCard(sample, infinite ? `${sample.id}-${index}` : sample.id),
        )}
      </div>
      <button
        className={`sample-slider-btn next${canNext ? '' : ' is-off'}`}
        type="button"
        aria-label="다음"
        disabled={!canNext}
        onClick={() => scroll(1)}
      >
        ›
      </button>
    </div>
  )
}
