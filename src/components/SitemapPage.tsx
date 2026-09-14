import { isSupervisor } from '../lib/auth'
import { PageShell } from './PageShell'
import { goSite, SUPERVISOR_LINKS, visibleSiteLinks, type AppView, type SiteNav } from '../lib/siteNav'

type SitemapGroup = {
  title: string
  tone: 'travel' | 'info' | 'community' | 'admin'
  ids: AppView[]
}

const GROUPS: SitemapGroup[] = [
  { title: '여행', tone: 'travel', ids: ['samples', 'trips'] },
  { title: '정보', tone: 'info', ids: ['info', 'gallery'] },
  { title: '커뮤니티', tone: 'community', ids: ['board', 'inquiry'] },
  {
    title: '관리',
    tone: 'admin',
    ids: ['catalog', 'taxonomyCity', 'taxonomyCategory', 'taxonomySightType', 'taxonomyFoodType', 'usersAdmin'],
  },
]

export function SitemapPage(nav: SiteNav) {
  const linkMap = new Map(
    [
      ...visibleSiteLinks(nav.user).filter((link) => link.id !== 'sitemap'),
      ...(isSupervisor(nav.user) ? SUPERVISOR_LINKS : []),
    ].map((link) => [link.id, link.label]),
  )

  function renderCard(group: SitemapGroup) {
    const items = group.ids.filter((id) => linkMap.has(id))
    if (!items.length) return null
    return (
      <article key={group.title} className={`sitemap-card sitemap-card-${group.tone}`}>
        <h3>{group.title}</h3>
        <div className="sitemap-card-links">
          {items.map((id) => (
            <button
              key={id}
              className="sitemap-link"
              type="button"
              onClick={() => goSite(nav, id)}
            >
              {linkMap.get(id)}
            </button>
          ))}
        </div>
      </article>
    )
  }

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>사이트맵</h2>
        </div>
        <div className="sitemap-grid">
          <article className="sitemap-card sitemap-card-home">
            <h3>홈</h3>
            <div className="sitemap-card-links">
              <button className="sitemap-link" type="button" onClick={nav.go.home}>
                메인으로
              </button>
            </div>
          </article>
          {GROUPS.map(renderCard)}
          {nav.user ? (
            <article className="sitemap-card sitemap-card-account">
              <h3>내 계정</h3>
              <div className="sitemap-card-links">
                {isSupervisor(nav.user) ? (
                  <button className="sitemap-link" type="button" onClick={() => nav.go.catalog()}>
                    카탈로그
                  </button>
                ) : null}
                <button className="sitemap-link" type="button" onClick={() => nav.go.galleryWrite()}>
                  갤러리 등록
                </button>
                <button className="sitemap-link" type="button" onClick={nav.go.profile}>
                  내정보수정
                </button>
              </div>
            </article>
          ) : (
            <article className="sitemap-card sitemap-card-account">
              <h3>로그인</h3>
              <div className="sitemap-card-links">
                <button className="sitemap-link" type="button" onClick={nav.go.auth}>
                  로그인 / 회원가입
                </button>
              </div>
            </article>
          )}
        </div>
      </section>
    </PageShell>
  )
}
