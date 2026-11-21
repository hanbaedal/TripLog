import type { Market, SampleRecord, Trip, User } from '../types'
import { isSupervisor } from '../lib/auth'
import { sampleMarket } from '../lib/market'
import { SAMPLE_CATALOG } from './sampleCatalog.js'
import { hasItemPhoto } from './sightPhotos'
import { sampleCoverPhotoId } from './sampleCovers'
import { addDays, dayCount, todayIso } from '../lib/dates'
import { uid } from '../lib/id'
import { api } from '../lib/remote'

export { SAMPLE_CATALOG }

const DEMO_SAMPLE_TITLE = '오사카, 네 끼를 따라 걷다'

export function isKnownSampleTitle(title: string): boolean {
  if (title === DEMO_SAMPLE_TITLE) return true
  return SAMPLE_CATALOG.some((row) => row.title === title)
}

export function isBlankDraft(trip: Trip): boolean {
  return !(trip.destination || '').trim() && (!trip.items || trip.items.length === 0)
}

export function isPersonalTrip(trip: Trip): boolean {
  if (isBlankDraft(trip)) return false
  if (trip.savedByUser === false) return false
  if (trip.savedByUser === true) return true
  return true
}

export function nightsLabel(nights: number): string {
  if (nights === 0) return '당일'
  return `${nights}박 ${nights + 1}일`
}

export function sampleDisplayNights(sample: SampleRecord): number {
  const embedded = sample.trip
  if (embedded?.startDate && embedded?.endDate) {
    return tripNightsFromDates(embedded.startDate, embedded.endDate)
  }
  return Math.max(0, sample.nights)
}

export function compareSamples(a: SampleRecord, b: SampleRecord): number {
  return (
    sampleDisplayNights(a) - sampleDisplayNights(b) ||
    a.sort - b.sort ||
    a.place.localeCompare(b.place, 'ko')
  )
}

export function filterSamplesByMarket(samples: SampleRecord[], market: Market): SampleRecord[] {
  return samples.filter((row) => sampleMarket(row) === market)
}

export function tripNightsFromDates(startDate: string, endDate: string): number {
  return Math.max(0, dayCount(startDate, endDate) - 1)
}

export function cloneSampleTrip(sample: SampleRecord): Trip {
  const embedded = sample.trip
  const span = tripNightsFromDates(embedded.startDate, embedded.endDate)
  const nights = span > 0 ? span : Math.max(0, sample.nights)
  const start = todayIso()
  return {
    ...embedded,
    id: uid('trip'),
    title: sample.title || embedded.title,
    destination: sample.destination || sample.place || embedded.destination,
    startDate: start,
    endDate: addDays(start, nights),
    items: (sample.trip.items || []).map((entry) => ({
      ...entry,
      id: uid('item'),
      photoId:
        hasItemPhoto(entry.kind)
          ? entry.photoId || entry.photo || sampleCoverPhotoId(sample)
          : entry.photoId,
      photo: undefined,
    })),
    market: sampleMarket(sample),
    updatedAt: new Date().toISOString(),
    savedByUser: false,
  }
}

export async function listSamples(): Promise<SampleRecord[]> {
  const data = await api<{ samples: SampleRecord[] }>('/samples')
  return (data.samples || []).sort(compareSamples)
}

export async function saveSample(sample: SampleRecord): Promise<SampleRecord> {
  if (sample.id && !sample.id.startsWith('new-')) {
    const data = await api<{ sample: SampleRecord }>(`/samples/${sample.id}`, {
      method: 'PUT',
      body: JSON.stringify(sample),
    })
    return data.sample
  }
  const data = await api<{ sample: SampleRecord }>('/samples', {
    method: 'POST',
    body: JSON.stringify(sample),
  })
  return data.sample
}

export async function removeSample(id: string): Promise<SampleRecord[]> {
  const data = await api<{ samples: SampleRecord[] }>(`/samples/${id}`, { method: 'DELETE' })
  return data.samples || []
}

export function sampleFromTrip(trip: Trip, previous?: Partial<SampleRecord>): SampleRecord {
  const nights = tripNightsFromDates(trip.startDate, trip.endDate)
  const place = (
    trip.destination ||
    trip.title ||
    previous?.place ||
    '새 여행지'
  )
    .split(/[·,]/)[0]
    .trim()
  const market = trip.market || previous?.market || 'cn'
  return {
    id: previous?.id || uid('sample'),
    sort: previous?.sort ?? 80,
    nights,
    place,
    title: trip.title || place,
    destination: trip.destination || place || trip.title,
    market,
    region: previous?.region,
    trip: {
      ...trip,
      startDate: trip.startDate,
      endDate: trip.endDate,
      market,
    },
    ownerId: previous?.ownerId,
    ownerName: previous?.ownerName,
    sourceTripId: previous?.sourceTripId || trip.id,
  }
}

export function canManageSample(sample: SampleRecord, user: User | null): boolean {
  if (!user) return false
  if (isSupervisor(user)) return true
  return Boolean(sample.ownerId && sample.ownerId === user.id)
}

export function isCatalogSample(sample: SampleRecord): boolean {
  return SAMPLE_CATALOG.some((row) => row.id === sample.id)
}
