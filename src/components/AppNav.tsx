import type { ReactNode } from 'react'
import { BrandMark } from './Icons'
import type { User } from '../types'

export type AppView = 'home' | 'samples' | 'trips' | 'planner' | 'guide'

type Props = {
  view: AppView
  user: User | null
  onHome: () => void
  onSamples: () => void
  onTrips: () => void
  onNewTrip: () => void
  onAuth: () => void
  onLogout?: () => void
  extra?: ReactNode
}

export function AppNav({
  view,
  user,
  onHome,
  onSamples,
  onTrips,
  onNewTrip,
  onAuth,
  onLogout,
  extra,
}: Props) {
  return (
    <header className="wrap topnav">
      <button className="brand" type="button" onClick={onHome}>
        <BrandMark className="brand-mark" />
        <span className="brand-name">
          triplog.my
          <small>private travel log</small>
        </span>
      </button>
      <nav className="nav-actions" aria-label="주요 메뉴">
        <button className={`btn ghost${view === 'home' ? ' is-on' : ''}`} type="button" onClick={onHome}>
          메뉴
        </button>
        <button className={`btn ghost${view === 'samples' ? ' is-on' : ''}`} type="button" onClick={onSamples}>
          샘플 일정
        </button>
        <button className={`btn ghost${view === 'trips' ? ' is-on' : ''}`} type="button" onClick={onTrips}>
          내 여행
        </button>
        <button className="btn ghost" type="button" onClick={onNewTrip}>
          새 여행
        </button>
        {user ? (
          <>
            <span className="who">{user.name}</span>
            {onLogout ? (
              <button className="btn ghost" type="button" onClick={onLogout}>
                로그아웃
              </button>
            ) : null}
          </>
        ) : (
          <button className="btn ghost" type="button" onClick={onAuth}>
            로그인
          </button>
        )}
        {extra}
      </nav>
    </header>
  )
}
