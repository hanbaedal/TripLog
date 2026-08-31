import { useLayoutEffect, useRef } from 'react'
import { goSite, visibleSiteLinks, type SiteNav } from '../lib/siteNav'

type Props = SiteNav

export function AppNav({ view, user, go }: Props) {
  const header = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = header.current
    if (!el) return
    const apply = () => {
      const height = Math.min(Math.max(el.offsetHeight, 48), 96)
      document.documentElement.style.setProperty('--nav-h', `${height}px`)
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <header className="site-header" ref={header}>
      <div className="wrap topnav">
        <button className="brand" type="button" onClick={go.home}>
          <img className="brand-title" src="/brand/header-brush.png" alt="나만의 맞춤 여행 일지" />
        </button>
        <nav className="nav-actions" aria-label="주요 메뉴">
          {visibleSiteLinks(user).map((link) => (
            <button
              key={link.id}
              className={`btn ghost${view === link.id ? ' is-on' : ''}`}
              type="button"
              onClick={() => goSite({ view, user, go }, link.id)}
            >
              {link.label}
            </button>
          ))}
          {user ? (
            <button className="btn ghost" type="button" onClick={go.logout}>
              로그아웃
            </button>
          ) : (
            <button className="btn ghost" type="button" onClick={go.auth}>
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
