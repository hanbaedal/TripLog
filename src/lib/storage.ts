import type { Trip } from '../types'

const KEY = 'triplog.trip.v1'

export function loadTrip(): Trip | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Trip
    if (!parsed?.id || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveTrip(trip: Trip): void {
  localStorage.setItem(KEY, JSON.stringify(trip))
}
