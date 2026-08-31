import { BrandMark } from './Icons'
import type { User } from '../types'

type Props = {
  user: User | null
  tripCount: number
  onOpenSamples: () => void
  onNewTrip: () => void
  onContinue: () => void
  onTrips: () => void
  onAuth: () => void
  onLogout: () => void
}

const tiles = [
  { cls: 'move', en: 'Itinerary', ko: '일정' },
  { cls: 'cost', en: 'People', ko: '인원' },
  { cls: 'flight', en: 'Flights', ko: '항공' },
  { cls: 'hotel', en: 'Stay', ko: '호텔' },
  { cls: 'meal', en: 'Meals', ko: '식사' },
  { cls: 'sight', en: 'Sights', ko: '관광' },
  { cls: 'move', en: 'Transit', ko: '교통' },
  { cls: 'cost', en: 'Budget', ko: '예상비용' },
  { cls: 'sight', en: 'Guidebook', ko: '여행 안내서' },
] as const

export function Landing({
  user,
  tripCount,
  onOpenSamples,
  onNewTrip,
  onContinue,
  onTrips,
  onAuth,
  onLogout,
}: Props) {
  return (
    <div>
      <header className="wrap topnav">
        <a className="brand" href="#home" onClick={(e) => e.preventDefault()}>
          <BrandMark className="brand-mark" />
          <span className="brand-name">
            triplog.my
            <small>private travel log</small>
          </span>
        </a>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="who">{user.name}</span>
              <button className="btn ghost" type="button" onClick={onTrips}>
                내 여행
              </button>
              <button className="btn ghost" type="button" onClick={onLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button className="btn ghost" type="button" onClick={onAuth}>
              로그인
            </button>
          )}
          {tripCount > 0 && !user ? (
            <button className="btn ghost" type="button" onClick={onContinue}>
              이어서 짜기
            </button>
          ) : null}
          <button className="btn ghost" type="button" onClick={onNewTrip}>
            새 여행
          </button>
          <button className="btn" type="button" onClick={onOpenSamples}>
            샘플 일정 열기
          </button>
        </div>
      </header>

      <section className="wrap hero">
        <div>
          <h1>
            일정을 그리면
            <br />
            비용과 안내서가
            <br />
            따라옵니다.
          </h1>
          <div className="hero-ctas">
            <button className="btn stamp" type="button" onClick={onOpenSamples}>
              샘플 일정 열기
            </button>
            <button className="btn ghost" type="button" onClick={onNewTrip}>
              빈 일정으로 시작
            </button>
          </div>
        </div>

        <aside className="pass" aria-hidden="true">
          <div className="pass-top">
            <b>BOARDING PASS</b>
            <span>TRIPLOG</span>
          </div>
          <div className="pass-body">
            <div className="pass-route">
              <div>
                <small className="muted">From</small>
                <strong>ICN</strong>
              </div>
              <div className="dash-line" />
              <div>
                <small className="muted">To</small>
                <strong>KIX</strong>
              </div>
            </div>
            <div className="pass-meta">
              <div>
                여행
                <b>오사카 4박 5일</b>
              </div>
              <div>
                인원
                <b>성인 2</b>
              </div>
              <div>
                항공
                <b>KE723 / KE728</b>
              </div>
              <div>
                숙소
                <b>난바 오리엔탈</b>
              </div>
            </div>
            <div className="stamp-seal">
              MAP
              <br />
              MY
              <br />
              JOURNEY
            </div>
          </div>
        </aside>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>여행에 실제로 필요한 칸만</h2>
        </div>
        <div className="mosaic">
          {tiles.map((tile) => (
            <article className={`tile ${tile.cls}`} key={tile.ko}>
              <div>
                <div className="en">{tile.en}</div>
                <h3>{tile.ko}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>세 번이면 안내서까지</h2>
        </div>
        <div className="steps">
          <article className="step">
            <em>01</em>
            <h3>하루를 쌓습니다</h3>
          </article>
          <article className="step">
            <em>02</em>
            <h3>비용이 스스로 더해집니다</h3>
          </article>
          <article className="step">
            <em>03</em>
            <h3>안내서를 인쇄합니다</h3>
          </article>
        </div>
      </section>

      <footer className="wrap site-footer">
        <div>
          <strong>triplog.my</strong>
        </div>
      </footer>
    </div>
  )
}
