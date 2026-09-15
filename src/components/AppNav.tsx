import { useLayoutEffect, useRef } from 'react'
import type { Market } from '../types'
import type { SiteNav } from '../lib/siteNav'
import { MARKET_SHORT } from '../lib/market'

type Props = SiteNav & {
  menuOpen?: boolean
  onOpenMenu?: () => void
}

export function AppNav({ user, market, setMarket, go, menuOpen, onOpenMenu }: Props) {
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
  }, [user?.name, market])

  function pick(next: Market) {
    if (next === market) return
    setMarket(next)
  }

  return (
    <header className="site-header" ref={header}>
      <div className="wrap topnav">
        <div className="header-leading">
          <button className="brand" type="button" onClick={go.home}>
            <img className="brand-title" src="/brand/header-brush.png" alt="나만의 맞춤 여행 일지" />
          </button>
        </div>
        <div className="header-user">
          <div className="market-switch" role="group" aria-label="여행 시장 선택">
            <button
              type="button"
              className={`market-flag${market === 'kr' ? ' is-on' : ''}`}
              aria-pressed={market === 'kr'}
              aria-label="국내 여행"
              title={`${MARKET_SHORT.kr} 여행`}
              onClick={() => pick('kr')}
            >
              <span className="market-flag-emoji" aria-hidden="true">
                🇰🇷
              </span>
            </button>
            <button
              type="button"
              className={`market-flag${market === 'cn' ? ' is-on' : ''}`}
              aria-pressed={market === 'cn'}
              aria-label="중국 여행"
              title={`${MARKET_SHORT.cn} 여행`}
              onClick={() => pick('cn')}
            >
              <span className="market-flag-emoji" aria-hidden="true">
                🇨🇳
              </span>
            </button>
          </div>
          {user ? (
            <button className="header-user-name" type="button" onClick={go.profile}>
              {user.name}
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
