import { AppNav } from './AppNav'
import type { Trip } from '../types'
import { buildGuidebook } from '../lib/guide'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  trip: Trip
  onBack: () => void
}

export function Guidebook({ trip, onBack, ...nav }: Props) {
  const book = buildGuidebook(trip)

  return (
    <div className="guide-page">
      <AppNav {...nav} />
      <div className="guide-toolbar no-print">
        <div className="wrap" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <div className="nav-actions">
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
