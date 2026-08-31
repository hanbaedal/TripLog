import type { Trip } from '../types'
import { loadTrip as loadLegacyTrip } from './storage'
import { api, isRemote } from './remote'

const KEY = 'triplog.trips.v1'

function readAll(): Record<string, Trip[]> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Trip[]>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(all: Record<string, Trip[]>): void {
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function ownerIdOf(userId: string | null | undefined): string {
  return userId ?? 'guest'
}

export function loadTrips(ownerId: string): Trip[] {
  const all = readAll()
  const list = all[ownerId]
  if (list?.length) return list
  if (ownerId === 'guest') {
    const legacy = loadLegacyTrip()
    if (legacy) {
      const migrated = [{ ...legacy, updatedAt: legacy.updatedAt ?? new Date().toISOString() }]
      all.guest = migrated
      writeAll(all)
      return migrated
    }
  }
  return []
}

export function saveTrips(ownerId: string, trips: Trip[]): void {
  const all = readAll()
  all[ownerId] = trips
  writeAll(all)
}

export function upsertTrip(ownerId: string, trip: Trip): Trip {
  const next = { ...trip, updatedAt: new Date().toISOString() }
  const trips = loadTrips(ownerId)
  const index = trips.findIndex((t) => t.id === next.id)
  if (index >= 0) trips[index] = next
  else trips.unshift(next)
  saveTrips(ownerId, trips)
  return next
}

export function deleteTrip(ownerId: string, tripId: string): Trip[] {
  const trips = loadTrips(ownerId).filter((t) => t.id !== tripId)
  saveTrips(ownerId, trips)
  return trips
}

export function importGuestTrips(userId: string): void {
  const mine = loadTrips(userId)
  if (mine.length) return
  const guest = loadTrips('guest')
  if (!guest.length) return
  saveTrips(userId, guest.map((trip) => ({ ...trip, updatedAt: new Date().toISOString() })))
}

export async function listTripsRemote(): Promise<Trip[]> {
  const data = await api<{ trips: Trip[] }>('/trips')
  return data.trips
}

export async function upsertTripRemote(trip: Trip): Promise<Trip> {
  const data = await api<{ trip: Trip }>(`/trips/${encodeURIComponent(trip.id)}`, {
    method: 'PUT',
    body: JSON.stringify(trip),
  })
  return data.trip
}

export async function deleteTripRemote(tripId: string): Promise<Trip[]> {
  const data = await api<{ trips: Trip[] }>(`/trips/${encodeURIComponent(tripId)}`, {
    method: 'DELETE',
  })
  return data.trips
}

export async function importGuestTripsRemote(): Promise<void> {
  if (!isRemote()) return
  const existing = await listTripsRemote()
  if (existing.length) return
  const guest = loadTrips('guest')
  for (const trip of guest) {
    await upsertTripRemote(trip)
  }
}
