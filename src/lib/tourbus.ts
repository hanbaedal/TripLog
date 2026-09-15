import { api } from './remote'
import { resolveTourBusCity, TOUR_BUS_PILOT_CITIES } from '../data/krTourBusCatalog.js'

export type TourBusCourseType = 'loop' | 'package' | 'themed'

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
  times: string[]
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
}

export type TourBusPick = {
  city: string
  cityLabel: string
  course: TourBusCourse
  time: string
  title: string
  place: string
  note: string
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

export function buildTourBusPick(cityDoc: TourBusCityDoc, course: TourBusCourse, time: string): TourBusPick {
  const noteBits = [
    `[참고용] ${cityDoc.disclaimer}`,
    course.operator ? `운영: ${course.operator}` : '',
    course.routeSummary ? `코스: ${course.routeSummary}` : '',
    course.closedNote || (course.closedDays?.length ? `휴무: ${course.closedDays.join('·')}` : ''),
    course.note || '',
    cityDoc.sourceUrl ? `공식: ${cityDoc.sourceUrl}` : '',
  ].filter(Boolean)

  return {
    city: cityDoc.city,
    cityLabel: cityDoc.cityLabel,
    course,
    time,
    title: `투어버스 · ${course.title}`,
    place: course.departPlace,
    note: noteBits.join('\n'),
  }
}
