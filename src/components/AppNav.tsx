import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { goSite, SUPERVISOR_LINKS, visibleSiteLinks, type SiteNav } from '../lib/siteNav'
import { isSupervisor } from '../lib/auth'

type Props = SiteNav

export function AppNav({ view, user, go }: Props) {
  const header = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useLayoutEffect(() => {
    const el = header.current
    if (!el) return
    const apply = () => {
      const height = Math.max(el.offsetHeight, 48)
      document.documentElement.style.setProperty('--nav-h', `${height}px`)
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [view])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const nav = { view, user, go }

  const links = [
    ...visibleSiteLinks(user),
    ...(isSupervisor(user) ? SUPERVISOR_LINKS : []),
  ]

  function pick(id: Parameters<typeof goSite>[1]) {
    goSite(nav, id)
    setMenuOpen(false)
  }

  function onAuth() {
    if (user) go.logout()
    else go.auth()
    setMenuOpen(false)
  }

  return (
    <header className="site-header" ref={header}>
      <div className="wrap topnav">
        <button className="brand" type="button" onClick={go.home}>
          <img className="brand-title" src="/brand/header-brush.png" alt="나만의 맞춤 여행 일지" />
        </button>
        <button
          type="button"
          className={`nav-menu-toggle${menuOpen ? ' is-open' : ''}`}
          aria-expanded={menuOpen}
          aria-controls="site-nav-menu"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <nav
          id="site-nav-menu"
          className={`nav-actions${menuOpen ? ' is-open' : ''}`}
          aria-label="주요 메뉴"
        >
          {links.map((link) => (
            <button
              key={link.id}
              className={`btn ghost${view === link.id ? ' is-on' : ''}`}
              type="button"
              onClick={() => pick(link.id)}
            >
              {link.label}
            </button>
          ))}
          <button className="btn ghost" type="button" onClick={onAuth}>
            {user ? '로그아웃' : '로그인'}
          </button>
        </nav>
      </div>
    </header>
  )
}
