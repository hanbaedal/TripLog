import { goSite, SUPERVISOR_LINKS, visibleSiteLinks, type SiteNav } from '../lib/siteNav'
import { isSupervisor } from '../lib/auth'

export function SideMenu(nav: SiteNav) {
  const links = [
    ...visibleSiteLinks(nav.user),
    ...(isSupervisor(nav.user) ? SUPERVISOR_LINKS : []),
  ]

  return (
    <aside className="side-menu" aria-label="왼쪽 메뉴">
      <button
        className={`side-menu-item${nav.view === 'home' ? ' is-on' : ''}`}
        type="button"
        onClick={nav.go.home}
      >
        홈
      </button>
      {links.map((link) => (
        <button
          key={link.id}
          className={`side-menu-item${nav.view === link.id ? ' is-on' : ''}`}
          type="button"
          onClick={() => goSite(nav, link.id)}
        >
          {link.label}
        </button>
      ))}
      {nav.user ? (
        <button className="side-menu-item" type="button" onClick={nav.go.logout}>
          로그아웃
        </button>
      ) : (
        <button className="side-menu-item" type="button" onClick={nav.go.auth}>
          로그인
        </button>
      )}
    </aside>
  )
}
