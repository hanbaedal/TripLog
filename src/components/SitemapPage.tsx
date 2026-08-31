import { PageShell } from './PageShell'
import { SITE_LINKS, goSite, type SiteNav } from '../lib/siteNav'

export function SitemapPage(nav: SiteNav) {
  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>사이트맵</h2>
        </div>
        <div className="sitemap-list">
          <button className="btn ghost" type="button" onClick={nav.go.home}>
            홈
          </button>
          {SITE_LINKS.map((link) => (
            <button key={link.id} className="btn ghost" type="button" onClick={() => goSite(nav, link.id)}>
              {link.label}
            </button>
          ))}
          <button className="btn ghost" type="button" onClick={nav.go.galleryWrite}>
            갤러리 등록
          </button>
        </div>
      </section>
    </PageShell>
  )
}
