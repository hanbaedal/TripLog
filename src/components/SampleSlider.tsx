import { useEffect, useRef, useState } from 'react'
import type { SampleRecord } from '../types'
import { sampleCover } from '../data/sampleCovers'

type Props = {
  items: SampleRecord[]
  supervisor?: boolean
  onPick: (sample: SampleRecord) => void
  onEdit?: (sample: SampleRecord) => void
  onDelete?: (id: string) => void
}

export function SampleSlider({ items, supervisor, onPick, onEdit, onDelete }: Props) {
  const track = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  function updateArrows() {
    const el = track.current
    if (!el) return
    setCanPrev(el.scrollLeft > 12)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 12)
  }

  useEffect(() => {
    const el = track.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [items])

  function scroll(dir: -1 | 1) {
    const el = track.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.sample-card')
    const step = card ? card.offsetWidth + 14 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <div className="sample-slider">
      {canPrev ? (
        <button className="sample-slider-btn prev" type="button" aria-label="이전" onClick={() => scroll(-1)}>
          ‹
        </button>
      ) : null}
      <div className="sample-slider-track" ref={track}>
        {items.map((sample) => (
          <article className="sample-card" key={sample.id}>
            <button type="button" className="sample-card-main" onClick={() => onPick(sample)}>
              <img className="sample-card-photo" src={sampleCover(sample)} alt="" />
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
        ))}
      </div>
      {canNext ? (
        <button className="sample-slider-btn next" type="button" aria-label="다음" onClick={() => scroll(1)}>
          ›
        </button>
      ) : null}
    </div>
  )
}
