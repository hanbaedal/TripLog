import {
  goSite,
  SUPERVISOR_LINKS,
  visibleSiteLinks,
  type AppView,
  type SiteNav,
} from '../lib/siteNav'

type Props = SiteNav & {
  drawerOpen?: boolean
  onDrawerClose?: () => void
}

type MenuGroup = { title: string; ids: AppView[] }

const MENU_GROUPS: MenuGroup[] = [
  { title: '여행', ids: ['samples', 'trips'] },
  { title: '정보', ids: ['info', 'gallery'] },
  { title: '커뮤니티', ids: ['board', 'inquiry'] },
]

const ADMIN_GROUP: MenuGroup = { title: '관리', ids: ['taxonomyAdmin', 'usersAdmin'] }

export function SideMenu({ drawerOpen, onDrawerClose, ...nav }: Props) {
  const linkMap = new Map(
    [...visibleSiteLinks(nav.user), ...SUPERVISOR_LINKS].map((link) => [link.id, link.label]),
  )

  function pick(id: AppView) {
    goSite(nav, id)
    onDrawerClose?.()
  }

  function renderGroup(group: MenuGroup) {
    const items = group.ids.filter((id) => linkMap.has(id))
    if (!items.length) return null
    return (
      <div key={group.title} className="side-menu-group">
        <p className="side-menu-group-title">{group.title}</p>
        {items.map((id) => (
          <button
            key={id}
            className={`side-menu-item${nav.view === id ? ' is-on' : ''}`}
            type="button"
            onClick={() => pick(id)}
          >
            {linkMap.get(id)}
          </button>
        ))}
      </div>
    )
  }

  return (
    <aside className={`side-menu${drawerOpen ? ' is-open' : ''}`} aria-label="탐색 메뉴">
      <button
        className={`side-menu-item${nav.view === 'home' ? ' is-on' : ''}`}
        type="button"
        onClick={() => {
          nav.go.home()
          onDrawerClose?.()
        }}
      >
        홈
      </button>
      {MENU_GROUPS.map(renderGroup)}
      {renderGroup(ADMIN_GROUP)}
      {linkMap.has('sitemap') ? (
        <div className="side-menu-group side-menu-group-utility">
          <button
            className={`side-menu-item${nav.view === 'sitemap' ? ' is-on' : ''}`}
            type="button"
            onClick={() => pick('sitemap')}
          >
            {linkMap.get('sitemap')}
          </button>
        </div>
      ) : null}
      <div className="side-menu-group side-menu-group-auth">
        {nav.user ? (
          <button
            className="side-menu-item"
            type="button"
            onClick={() => {
              nav.go.logout()
              onDrawerClose?.()
            }}
          >
            로그아웃
          </button>
        ) : (
          <button
            className="side-menu-item"
            type="button"
            onClick={() => {
              nav.go.auth()
              onDrawerClose?.()
            }}
          >
            로그인
          </button>
        )}
      </div>
    </aside>
  )
}
