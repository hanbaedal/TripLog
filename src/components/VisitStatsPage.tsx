import { useEffect, useState } from 'react'
import { PageShell } from './PageShell'
import { isSupervisor } from '../lib/auth'
import { fetchVisitStats, type VisitStats } from '../lib/visits'
import type { SiteNav } from '../lib/siteNav'

function pct(part: number, whole: number) {
  if (!whole) return 0
  return Math.max(0, Math.min(100, (part / whole) * 100))
}

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
  const cards = stats
    ? [
        { label: '오늘 방문자 (UV)', value: stats.todayUv ?? 0 },
        { label: '오늘 페이지뷰 (PV)', value: stats.today },
        { label: '최근 7일 방문자', value: stats.uv7d ?? 0 },
        { label: '최근 30일 방문자', value: stats.uv30d ?? 0 },
        { label: '누적 페이지뷰 (PV)', value: stats.allTimePv ?? stats.total },
        { label: '누적 방문자 (UV)', value: stats.allTimeUv ?? 0 },
      ]
    : []

  return (
    <PageShell {...nav}>
      <section className="wrap section admin-section visit-stats">
        <div className="section-head">
          <div>
            <h2>방문통계</h2>
            <p className="visit-stats-lead muted">
              손님(비로그인) UV·PV와 로그인 방문, 일별 추이·화면·경로를 한눈에 봅니다.
            </p>
          </div>
          <div className="nav-actions">
            <label className="visit-stats-days">
              추이 기간
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
            <div className="visit-stats-cards visit-stats-cards-6">
              {cards.map((card) => (
                <div className="visit-stat-card" key={card.label}>
                  <p className="visit-stat-label">{card.label}</p>
                  <p className="visit-stat-value">{card.value.toLocaleString('ko-KR')}</p>
                </div>
              ))}
            </div>

            <div className="visit-stat-card visit-stat-card-wide">
              <p className="visit-stat-label">로그인 방문 (누적 PV)</p>
              <p className="visit-stat-value visit-stat-value-sm">
                {(stats.loggedInAll ?? stats.loggedIn).toLocaleString('ko-KR')}
              </p>
              <p className="visit-stats-hint muted">
                선택 기간 {stats.days}일 · 전체 {stats.total.toLocaleString('ko-KR')} · 로그인{' '}
                {stats.loggedIn.toLocaleString('ko-KR')} · 비로그인 {stats.guest.toLocaleString('ko-KR')}
              </p>
            </div>

            <h3 className="visit-stats-subtitle">일별 추이</h3>
            <p className="visit-stats-hint muted">
              막대: 비로그인 PV(진함) / 로그인 PV(옅음). 숫자는 UV · 비로그인PV/로그인PV.
            </p>
            <div className="visit-day-bars">
              {stats.byDay.some((row) => row.count > 0) ? (
                stats.byDay.map((row) => {
                  const guest = row.guest ?? Math.max(0, row.count - (row.loggedIn || 0))
                  const loggedIn = row.loggedIn ?? 0
                  const total = row.count || guest + loggedIn
                  const width = total ? Math.max(4, (total / maxDay) * 100) : 0
                  return (
                    <div className="visit-day-row" key={row.day}>
                      <span className="visit-day-label">{row.day.slice(5)}</span>
                      <span className="visit-day-bar-track">
                        <span className="visit-day-bar-stack" style={{ width: `${width}%` }}>
                          <span className="visit-day-bar-guest" style={{ width: `${pct(guest, total)}%` }} />
                          <span className="visit-day-bar-user" style={{ width: `${pct(loggedIn, total)}%` }} />
                        </span>
                      </span>
                      <span className="visit-day-count">
                        {row.uv ?? 0} · {guest}/{loggedIn}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="muted">아직 기록이 없습니다. 화면을 이동하면 집계됩니다.</p>
              )}
            </div>

            <h3 className="visit-stats-subtitle">상위 경로</h3>
            <div className="visit-stats-table-wrap">
              <table className="visit-stats-table">
                <thead>
                  <tr>
                    <th>경로</th>
                    <th className="num">조회</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.byPath || []).map((row) => (
                    <tr key={row.path}>
                      <td className="mono">{row.path}</td>
                      <td className="num">{row.count.toLocaleString('ko-KR')}</td>
                    </tr>
                  ))}
                  {!(stats.byPath || []).length ? (
                    <tr>
                      <td colSpan={2} className="muted">
                        데이터 없음
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="visit-stats-split">
              <div>
                <h3 className="visit-stats-subtitle">화면별</h3>
                <div className="visit-stats-table-wrap">
                  <table className="visit-stats-table">
                    <thead>
                      <tr>
                        <th>화면</th>
                        <th className="num">조회</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.byView.map((row) => (
                        <tr key={row.view}>
                          <td>{row.label}</td>
                          <td className="num">{row.count.toLocaleString('ko-KR')}</td>
                        </tr>
                      ))}
                      {!stats.byView.length ? (
                        <tr>
                          <td colSpan={2} className="muted">
                            데이터 없음
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="visit-stats-subtitle">시장별</h3>
                <div className="visit-stats-table-wrap">
                  <table className="visit-stats-table">
                    <thead>
                      <tr>
                        <th>시장</th>
                        <th className="num">조회</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.byMarket.map((row) => (
                        <tr key={row.market}>
                          <td>{row.label}</td>
                          <td className="num">{row.count.toLocaleString('ko-KR')}</td>
                        </tr>
                      ))}
                      {!stats.byMarket.length ? (
                        <tr>
                          <td colSpan={2} className="muted">
                            데이터 없음
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </PageShell>
  )
}
