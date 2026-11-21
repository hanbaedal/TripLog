import { api } from './remote'
import type { Market } from '../types'

const VISITOR_KEY = 'triplog.visitor'

export type VisitDayRow = {
  day: string
  count: number
  guest?: number
  loggedIn?: number
  uv?: number
}

export type VisitStats = {
  days: number
  total: number
  today: number
  loggedIn: number
  guest: number
  todayUv?: number
  uv7d?: number
  uv30d?: number
  allTimePv?: number
  allTimeUv?: number
  loggedInAll?: number
  byDay: VisitDayRow[]
  byView: { view: string; label: string; count: number }[]
  byMarket: { market: string; label: string; count: number }[]
  byPath?: { path: string; count: number }[]
}

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY) || ''
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(id)) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID().replace(/-/g, '')
          : `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

export async function trackVisit(view: string, market: Market): Promise<void> {
  try {
    await api('/visits', {
      method: 'POST',
      body: JSON.stringify({
        view,
        market,
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        visitorId: getVisitorId(),
      }),
    })
  } catch {
    /* ignore tracking errors */
  }
}

export async function fetchVisitStats(days = 30): Promise<VisitStats> {
  return api<VisitStats>(`/visits/stats?days=${days}`)
}
