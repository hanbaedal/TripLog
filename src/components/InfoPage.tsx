import { PageShell } from './PageShell'
import type { SiteNav } from '../lib/siteNav'

export function InfoPage(nav: SiteNav) {
  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>여행 정보</h2>
        </div>
        <div className="info-list">
          <article className="info-card">
            <h3>추천 일정</h3>
            <p className="muted">기간별로 짜 둔 일정을 보고, 회원은 내 여행으로 옮겨 고칩니다.</p>
            <button className="btn" type="button" onClick={nav.go.samples}>
              추천 일정
            </button>
          </article>
          <article className="info-card">
            <h3>내 여행</h3>
            <p className="muted">날짜·인원·항공·호텔·식사·관광을 한 장에 모읍니다. 가입 뒤에 저장됩니다.</p>
            <button className="btn" type="button" onClick={nav.go.trips}>
              내 여행
            </button>
          </article>
          <article className="info-card">
            <h3>안내서</h3>
            <p className="muted">일정을 넣은 뒤 안내서 미리보기로 인쇄하거나 PDF로 남길 수 있습니다.</p>
          </article>
        </div>
      </section>
    </PageShell>
  )
}
