import type { SampleRecord, Trip } from '../types'
import { SAMPLE_CATALOG } from './sampleCatalog.js'
import { hasItemPhoto, resolveItemPhoto } from './sightPhotos'
import { addDays, dayCount, todayIso } from '../lib/dates'
import { uid } from '../lib/id'
import { api, isRemote, probeRemote } from '../lib/remote'

const SAMPLES_KEY = 'triplog.samples.v1'

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
  if (trip.savedByUser === true) return true
  if (trip.savedByUser === false) return false
  return !isKnownSampleTitle(trip.title)
}

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
    items: (sample.trip.items || []).map((entry) => ({
      ...entry,
      id: uid('item'),
      photo:
        hasItemPhoto(entry.kind)
          ? entry.photo || resolveItemPhoto(entry, sample.destination || sample.place)
          : entry.photo,
    })),
    updatedAt: new Date().toISOString(),
    savedByUser: false,
  }
}

function seedLocal(): SampleRecord[] {
  return SAMPLE_CATALOG.map((row) => ({ ...row, trip: { ...row.trip, items: [...row.trip.items] } }))
}

function fillMissing(rows: SampleRecord[]): SampleRecord[] {
  const byId = new Map(rows.map((row) => [row.id, row]))
  for (const row of seedLocal()) {
    if (!byId.has(row.id)) byId.set(row.id, row)
  }
  return [...byId.values()]
}

function mergeCatalog(rows: SampleRecord[]): SampleRecord[] {
  const next = fillMissing(rows)
  if (next.length !== rows.length) writeLocal(next)
  return next
}

function readLocal(): SampleRecord[] {
  try {
    const raw = localStorage.getItem(SAMPLES_KEY)
    if (!raw) {
      const seed = seedLocal()
      writeLocal(seed)
      return seed
    }
    const parsed = JSON.parse(raw) as SampleRecord[]
    return Array.isArray(parsed) && parsed.length ? mergeCatalog(parsed) : seedLocal()
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
      if (Array.isArray(data.samples) && data.samples.length) {
        return fillMissing(data.samples).sort((a, b) => a.sort - b.sort || a.nights - b.nights)
      }
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
