import { useLayoutEffect, useRef } from 'react'
import type { SiteNav } from '../lib/siteNav'
import { isSupervisor } from '../lib/auth'

type Props = SiteNav & {
  menuOpen?: boolean
  onOpenMenu?: () => void
}

export function AppNav({ user, go, menuOpen, onOpenMenu }: Props) {
  const header = useRef<HTMLElement>(null)

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
  }, [user?.name])

  return (
    <header className="site-header" ref={header}>
      <div className="wrap topnav">
        <button className="brand" type="button" onClick={go.home}>
          <img className="brand-title" src="/brand/header-brush.png" alt="나만의 맞춤 여행 일지" />
        </button>
        <div className="header-user">
          {user ? (
            <button className="header-user-name" type="button" onClick={go.profile}>
              {user.name}
              {isSupervisor(user) ? <span className="header-user-role">슈퍼바이저</span> : null}
            </button>
          ) : (
            <button className="btn ghost header-auth-btn" type="button" onClick={go.auth}>
              로그인
            </button>
          )}
          <button
            type="button"
            className={`nav-menu-toggle${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen ?? false}
            onClick={() => onOpenMenu?.()}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
