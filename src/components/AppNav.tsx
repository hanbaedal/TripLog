import { useLayoutEffect, useRef } from 'react'
import { BrandMark } from './Icons'
import { SITE_LINKS, goSite, type SiteNav } from '../lib/siteNav'

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
          <BrandMark className="brand-mark" />
          <span className="brand-name">
            triplog.my
            <small>private travel log</small>
          </span>
        </button>
        <nav className="nav-actions" aria-label="주요 메뉴">
          {SITE_LINKS.map((link) => (
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
