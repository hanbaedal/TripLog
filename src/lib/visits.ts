import { api } from './remote'
import type { Market } from '../types'

export type VisitStats = {
  days: number
  total: number
  today: number
  loggedIn: number
  guest: number
  byDay: { day: string; count: number }[]
  byView: { view: string; label: string; count: number }[]
  byMarket: { market: string; label: string; count: number }[]
}

export async function trackVisit(view: string, market: Market): Promise<void> {
  try {
    await api('/visits', {
      method: 'POST',
      body: JSON.stringify({
        view,
        market,
        path: typeof window !== 'undefined' ? window.location.pathname : '',
      }),
    })
  } catch {
    /* ignore tracking errors */
  }
}

export async function fetchVisitStats(days = 30): Promise<VisitStats> {
  return api<VisitStats>(`/visits/stats?days=${days}`)
}
