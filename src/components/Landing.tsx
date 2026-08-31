import { BrandMark } from './Icons'
import type { User } from '../types'

type Props = {
  user: User | null
  tripCount: number
  onOpenDemo: () => void
  onNewTrip: () => void
  onContinue: () => void
  onTrips: () => void
  onAuth: () => void
  onLogout: () => void
}

const tiles = [
  { cls: 'move', en: 'Itinerary', ko: '일정', d: '날짜를 잡고 하루 타임라인으로 동선을 쌓습니다.' },
  { cls: 'cost', en: 'People', ko: '인원', d: '성인·소아 수에 맞춰 1인당 예상 비용을 나눕니다.' },
  { cls: 'flight', en: 'Flights', ko: '항공', d: '노선을 검색해 고르면 편명·운임이 일정과 비용에 바로 붙습니다.' },
  { cls: 'hotel', en: 'Stay', ko: '호텔', d: '숙소를 검색해 넣으면 밤마다 일정에 붙습니다. Track My Stay.' },
  { cls: 'meal', en: 'Meals', ko: '식사', d: '조식·중식·석식·야식을 끼니별로 계획하고 맛집 예산을 넣습니다.' },
  { cls: 'sight', en: 'Sights', ko: '관광', d: '명소와 입장료를 동선 위에 올려 하루를 과하지 않게 맞춥니다.' },
  { cls: 'move', en: 'Transit', ko: '교통', d: '기차·버스·페리·차량까지, 공항에서 숙소로 가는 길을 남깁니다.' },
  { cls: 'cost', en: 'Budget', ko: '예상비용', d: '항목이 쌓이면 항공·호텔·식사·관광·교통 합계가 자동으로 계산됩니다.' },
  { cls: 'sight', en: 'Guidebook', ko: '여행 안내서', d: '타임라인에서 하루하루 문장과 표가 만들어지고, 바로 인쇄할 수 있습니다.' },
] as const

export function Landing({
  user,
  tripCount,
  onOpenDemo,
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
          <button className="btn" type="button" onClick={onOpenDemo}>
            샘플 일정 열기
          </button>
        </div>
      </header>

      <section className="wrap hero">
        <div>
          <div className="kicker">나만의 여행 기록</div>
          <h1>
            일정을 그리면
            <br />
            비용과 안내서가
            <br />
            따라옵니다.
          </h1>
          <div className="slogans">
            <div className="en">triplog.my : Map My Journey, Track My Stay.</div>
            <div className="cn">triplog.my : 我的专属旅行足迹。</div>
            <div className="muted">나의 여정을 그리고, 숙소를 기록하다</div>
          </div>
          <p className="lead">
            로그인하면 여행이 계정에 남고, 항공·호텔은 검색해서 일정에 연동합니다.
            조식부터 야식까지 끼니와 예상 비용을 붙이면 안내서가 따라옵니다.
          </p>
          <div className="hero-ctas">
            <button className="btn stamp" type="button" onClick={onOpenDemo}>
              오사카 샘플 보기
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
          <p className="muted">일정 · 인원 · 항공 · 호텔 · 식사 · 관광 · 교통 · 비용 · 안내서</p>
        </div>
        <div className="mosaic">
          {tiles.map((tile) => (
            <article className={`tile ${tile.cls}`} key={tile.ko}>
              <div>
                <div className="en">{tile.en}</div>
                <h3>{tile.ko}</h3>
                <p>{tile.d}</p>
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
            <p className="muted">
              항공이 날짜를 열고, 호텔이 밤을 붙잡고, 끼니와 관광·교통이 그 사이를 채웁니다.
            </p>
          </article>
          <article className="step">
            <em>02</em>
            <h3>비용이 스스로 더해집니다</h3>
            <p className="muted">
              항목마다 금액을 적으면 카테고리별·하루별·1인당 합계가 오른쪽에서 바로 바뀝니다.
            </p>
          </article>
          <article className="step">
            <em>03</em>
            <h3>안내서를 인쇄합니다</h3>
            <p className="muted">
              일정 문장, 항공·숙소 표, 조중석야, 예상 비용이 한 부로 정리됩니다.
            </p>
          </article>
        </div>
      </section>

      <footer className="wrap site-footer">
        <div>
          <strong>triplog.my</strong>
          <div>Map My Journey, Track My Stay.</div>
          <div className="cn">我的专属旅行足迹。</div>
        </div>
        <div>로그인하면 MongoDB(triplog)에 일정이 저장됩니다. 항공·호텔은 시범 연동이며 결제·발권은 하지 않습니다.</div>
      </footer>
    </div>
  )
}
