import { useEffect, useState } from 'react'
import { PageShell } from './PageShell'
import { isSupervisor } from '../lib/auth'
import { fetchVisitStats, type VisitStats } from '../lib/visits'
import type { SiteNav } from '../lib/siteNav'

export function VisitStatsPage(nav: SiteNav) {
  const [stats, setStats] = useState<VisitStats | null>(null)
  const [error, setError] = useState('')
  const [days, setDays] = useState(30)
  const [busy, setBusy] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    if (!isSupervisor(nav.user)) {
      nav.go.home()
      return
    }
    setBusy(true)
    setError('')
    void fetchVisitStats(days)
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : '불러오지 못했습니다.'))
      .finally(() => setBusy(false))
  }, [nav.user, days, tick])

  const maxDay = Math.max(1, ...(stats?.byDay.map((row) => row.count) || [1]))

  return (
    <PageShell {...nav}>
      <section className="wrap section admin-section visit-stats">
        <div className="section-head">
          <h2>방문통계</h2>
          <div className="nav-actions">
            <label className="visit-stats-days">
              기간
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} disabled={busy}>
                <option value={7}>7일</option>
                <option value={30}>30일</option>
                <option value={90}>90일</option>
              </select>
            </label>
            <button className="btn ghost" type="button" disabled={busy} onClick={() => setTick((n) => n + 1)}>
              {busy ? '불러오는 중…' : '새로고침'}
            </button>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {stats ? (
          <>
            <div className="visit-stats-cards">
              <div className="visit-stat-card">
                <p className="visit-stat-label">오늘</p>
                <p className="visit-stat-value">{stats.today.toLocaleString('ko-KR')}</p>
              </div>
              <div className="visit-stat-card">
                <p className="visit-stat-label">최근 {stats.days}일</p>
                <p className="visit-stat-value">{stats.total.toLocaleString('ko-KR')}</p>
              </div>
              <div className="visit-stat-card">
                <p className="visit-stat-label">로그인 방문</p>
                <p className="visit-stat-value">{stats.loggedIn.toLocaleString('ko-KR')}</p>
              </div>
              <div className="visit-stat-card">
                <p className="visit-stat-label">비로그인</p>
                <p className="visit-stat-value">{stats.guest.toLocaleString('ko-KR')}</p>
              </div>
            </div>

            <h3 className="visit-stats-subtitle">일별 방문</h3>
            <div className="visit-day-bars">
              {stats.byDay.length ? (
                stats.byDay.map((row) => (
                  <div className="visit-day-row" key={row.day}>
                    <span className="visit-day-label">{row.day.slice(5)}</span>
                    <span className="visit-day-bar-track">
                      <span
                        className="visit-day-bar-fill"
                        style={{ width: `${Math.max(4, (row.count / maxDay) * 100)}%` }}
                      />
                    </span>
                    <span className="visit-day-count">{row.count}</span>
                  </div>
                ))
              ) : (
                <p className="muted">아직 기록이 없습니다. 화면을 이동하면 집계됩니다.</p>
              )}
            </div>

            <div className="visit-stats-split">
              <div>
                <h3 className="visit-stats-subtitle">화면별</h3>
                <div className="admin-table">
                  {stats.byView.map((row) => (
                    <div className="admin-row" key={row.view}>
                      <strong>{row.label}</strong>
                      <span>{row.count.toLocaleString('ko-KR')}</span>
                    </div>
                  ))}
                  {!stats.byView.length ? <p className="muted">데이터 없음</p> : null}
                </div>
              </div>
              <div>
                <h3 className="visit-stats-subtitle">시장별</h3>
                <div className="admin-table">
                  {stats.byMarket.map((row) => (
                    <div className="admin-row" key={row.market}>
                      <strong>{row.label}</strong>
                      <span>{row.count.toLocaleString('ko-KR')}</span>
                    </div>
                  ))}
                  {!stats.byMarket.length ? <p className="muted">데이터 없음</p> : null}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </PageShell>
  )
}
