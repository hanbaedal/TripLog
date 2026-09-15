import { api } from './remote'
import { resolveTourBusCity, TOUR_BUS_PILOT_CITIES } from '../data/krTourBusCatalog.js'

export type TourBusCourseType = 'loop' | 'package' | 'themed'

export type TourBusStop = {
  id: string
  label: string
  place: string
  hint?: string
  times: string[]
}

export type TourBusCourse = {
  id: string
  title: string
  type: TourBusCourseType
  operator?: string
  departPlace: string
  routeSummary?: string
  intervalMin?: number
  durationMin?: number
  closedDays?: string[]
  closedNote?: string
  note?: string
  /** 참고용 성인 1인 요금(원). 공식 사이트 기준, 할인·시즌 변동 가능 */
  fareAdult?: number
  /** 참고용 소인 1인 요금(원). 없으면 성인의 75%로 계산 */
  fareChild?: number
  times: string[]
  stops?: TourBusStop[]
  bookingUrl?: string
}

export type TourBusCityDoc = {
  city: string
  cityLabel: string
  disclaimer: string
  sourceUrl: string
  validUntil?: string
  courses: TourBusCourse[]
  updatedAt?: string
  source?: 'catalog' | 'opendata' | 'db'
}

export type TourBusDiscoverResult =
  | { status: 'found'; source: 'catalog' | 'opendata' | 'db'; saved: boolean; city: TourBusCityDoc }
  | { status: 'not_found'; query?: string; message?: string }
  | { status: 'invalid'; error?: string }
  | { status: 'error'; error?: string }

export type TourBusPick = {
  city: string
  cityLabel: string
  course: TourBusCourse
  stop?: TourBusStop
  time: string
  title: string
  place: string
  note: string
  /** 일행 합계 예산(원). fareAdult 기준 × 여행 인원 */
  budgetKrw?: number
}

export function computeTourBusBudget(
  course: Pick<TourBusCourse, 'fareAdult' | 'fareChild'>,
  adults: number,
  children: number,
): number {
  if (!course.fareAdult) return 0
  const childFare = course.fareChild ?? Math.round(course.fareAdult * 0.75)
  const a = Math.max(0, adults)
  const c = Math.max(0, children)
  const people = a + c
  if (people <= 0) return course.fareAdult
  return course.fareAdult * a + childFare * c
}

export { resolveTourBusCity, TOUR_BUS_PILOT_CITIES }

export async function listTourBusCities(): Promise<{ cities: { city: string; cityLabel: string }[] }> {
  try {
    return await api('/tourbus/cities')
  } catch {
    return { cities: TOUR_BUS_PILOT_CITIES }
  }
}

export async function loadTourBusCity(city: string): Promise<TourBusCityDoc | null> {
  const slug = resolveTourBusCity(city) || city
  if (!slug) return null
  try {
    const data = await api<{ city: TourBusCityDoc | null }>(`/tourbus/${encodeURIComponent(slug)}`)
    return data.city
  } catch {
    return null
  }
}

export async function discoverTourBusCity(query: string): Promise<TourBusDiscoverResult> {
  try {
    return await api<TourBusDiscoverResult>('/tourbus/discover', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  } catch {
    return { status: 'error', error: '투어버스 정보를 불러오지 못했습니다.' }
  }
}

export async function saveTourBusCity(city: TourBusCityDoc): Promise<TourBusCityDoc | null> {
  try {
    const data = await api<{ city: TourBusCityDoc }>('/tourbus/save', {
      method: 'POST',
      body: JSON.stringify({ city }),
    })
    return data.city
  } catch {
    return null
  }
}

export function buildTourBusPick(
  cityDoc: TourBusCityDoc,
  course: TourBusCourse,
  time: string,
  stop?: TourBusStop,
  pax?: { adults: number; children: number },
): TourBusPick {
  const budgetKrw = pax ? computeTourBusBudget(course, pax.adults, pax.children) : 0
  const fareLine =
    course.fareAdult && budgetKrw
      ? `참고 요금: 성인 ${course.fareAdult.toLocaleString()}원${
          course.fareChild != null ? ` · 소인 ${course.fareChild.toLocaleString()}원` : ''
        } · 일행 합계 ${budgetKrw.toLocaleString()}원`
      : course.fareAdult
        ? `참고 요금: 성인 ${course.fareAdult.toLocaleString()}원 (공식 사이트 확인)`
        : ''

  const noteBits = [
    `[참고용] ${cityDoc.disclaimer}`,
    fareLine,
    stop?.hint || '',
    course.operator ? `운영: ${course.operator}` : '',
    course.routeSummary ? `코스: ${course.routeSummary}` : '',
    course.closedNote || (course.closedDays?.length ? `휴무: ${course.closedDays.join('·')}` : ''),
    course.note || '',
    cityDoc.sourceUrl ? `공식: ${cityDoc.sourceUrl}` : '',
  ].filter(Boolean)

  const title = stop
    ? `투어버스 · ${course.title} · ${stop.label}`
    : `투어버스 · ${course.title}`

  return {
    city: cityDoc.city,
    cityLabel: cityDoc.cityLabel,
    course,
    stop,
    time,
    title,
    place: stop?.place || course.departPlace,
    note: noteBits.join('\n'),
    budgetKrw: budgetKrw || undefined,
  }
}
