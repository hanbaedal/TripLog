import { BrandMark } from './Icons'
import type { Trip } from '../types'
import { buildGuidebook } from '../lib/guide'

type Props = {
  trip: Trip
  onBack: () => void
  onHome: () => void
  onSamples: () => void
  onTrips: () => void
}

export function Guidebook({ trip, onBack, onHome, onSamples, onTrips }: Props) {
  const book = buildGuidebook(trip)

  return (
    <div className="guide-page">
      <div className="guide-toolbar no-print">
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button className="brand" type="button" onClick={onBack} style={{ background: 'none', border: 0, padding: 0 }}>
            <BrandMark className="brand-mark" />
            <span className="brand-name">
              triplog.my
              <small>guidebook</small>
            </span>
          </button>
          <div className="nav-actions">
            <button className="btn ghost" type="button" onClick={onHome}>
              메뉴
            </button>
            <button className="btn ghost" type="button" onClick={onSamples}>
              샘플 일정
            </button>
            <button className="btn ghost" type="button" onClick={onTrips}>
              내 여행
            </button>
            <button className="btn ghost" type="button" onClick={onBack}>
              일정으로
            </button>
            <button className="btn" type="button" onClick={() => window.print()}>
              인쇄 / PDF
            </button>
          </div>
        </div>
      </div>

      <article className="sheet">
        <div className="cover-brand">{book.cover.brand}</div>
        <h1>{book.cover.title}</h1>
        <p>
          {book.cover.destination} · {book.cover.range}
        </p>
        <p className="muted">{book.cover.people}</p>
        <div className="cover-slogs">
          {book.cover.slogans.map((line) => (
            <div key={line} className={line.includes('专属') ? 'cn' : ''}>
              {line}
            </div>
          ))}
        </div>
      </article>

      {book.blocks.map((block) => (
        <section className="sheet" key={`${block.kicker}-${block.title}`}>
          {block.kicker ? <div className="kicker">{block.kicker}</div> : null}
          <h2>{block.title}</h2>
          {block.paragraphs.map((p, i) => (
            <p key={i} className="muted" style={{ marginTop: 10 }}>
              {p}
            </p>
          ))}
          {block.rows?.length ? (
            <div className="rows">
              {block.rows.map((row, i) => (
                <div className="row" key={`${row.label}-${i}`}>
                  <div className="time">{row.time ?? ''}</div>
                  <div>
                    <b>{row.label}</b>
                    <div className="muted">{row.detail}</div>
                  </div>
                  <div className="cost-n">{row.cost}</div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  )
}
