import type { SampleRecord, Trip } from '../types'
import { SAMPLE_CATALOG } from './sampleCatalog.js'
import { addDays, dayCount, todayIso } from '../lib/dates'
import { uid } from '../lib/id'
import { api, isRemote, probeRemote } from '../lib/remote'

const SAMPLES_KEY = 'triplog.samples.v1'

export { SAMPLE_CATALOG }

export function nightsLabel(nights: number): string {
  return `${nights}박 ${nights + 1}일`
}

export function cloneSampleTrip(sample: SampleRecord): Trip {
  const start = todayIso()
  const nights = sample.nights
  return {
    ...sample.trip,
    id: uid('trip'),
    title: sample.title || sample.trip.title,
    destination: sample.destination || sample.place,
    startDate: start,
    endDate: addDays(start, nights),
    items: (sample.trip.items || []).map((entry) => ({ ...entry, id: uid('item') })),
    updatedAt: new Date().toISOString(),
  }
}

function seedLocal(): SampleRecord[] {
  return SAMPLE_CATALOG.map((row) => ({ ...row, trip: { ...row.trip, items: [...row.trip.items] } }))
}

function readLocal(): SampleRecord[] {
  try {
    const raw = localStorage.getItem(SAMPLES_KEY)
    if (!raw) {
      const seed = seedLocal()
      localStorage.setItem(SAMPLES_KEY, JSON.stringify(seed))
      return seed
    }
    const parsed = JSON.parse(raw) as SampleRecord[]
    return Array.isArray(parsed) && parsed.length ? parsed : seedLocal()
  } catch {
    return seedLocal()
  }
}

function writeLocal(rows: SampleRecord[]) {
  localStorage.setItem(SAMPLES_KEY, JSON.stringify(rows))
}

export async function listSamples(): Promise<SampleRecord[]> {
  if (isRemote() || (await probeRemote())) {
    try {
      const data = await api<{ samples: SampleRecord[] }>('/samples')
      if (Array.isArray(data.samples) && data.samples.length) return data.samples
    } catch {
      /* local fallback */
    }
  }
  return readLocal().sort((a, b) => a.sort - b.sort)
}

export async function saveSample(sample: SampleRecord): Promise<SampleRecord> {
  if (isRemote() || (await probeRemote())) {
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
  const rows = readLocal()
  const next = { ...sample, id: sample.id || uid('sample') }
  const idx = rows.findIndex((row) => row.id === next.id)
  if (idx >= 0) rows[idx] = next
  else rows.push(next)
  writeLocal(rows)
  return next
}

export async function removeSample(id: string): Promise<SampleRecord[]> {
  if (isRemote() || (await probeRemote())) {
    const data = await api<{ samples: SampleRecord[] }>(`/samples/${id}`, { method: 'DELETE' })
    return data.samples
  }
  const rows = readLocal().filter((row) => row.id !== id)
  writeLocal(rows)
  return rows
}

export function sampleFromTrip(trip: Trip, previous?: SampleRecord): SampleRecord {
  const nights = Math.max(1, dayCount(trip.startDate, trip.endDate) - 1)
  const place = (trip.destination || previous?.place || '새 여행지').split(/[·,]/)[0].trim()
  return {
    id: previous?.id || uid('sample'),
    sort: previous?.sort ?? 99,
    nights,
    place,
    title: trip.title || place,
    destination: trip.destination || place,
    trip,
  }
}
