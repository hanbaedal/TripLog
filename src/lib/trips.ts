import type { Trip } from '../types'
import { isPersonalTrip } from '../data/samples'
import { api } from './remote'

export function onlyPersonalTrips(trips: Trip[]): Trip[] {
  return trips.filter(isPersonalTrip)
}

export async function listTrips(): Promise<Trip[]> {
  const data = await api<{ trips: Trip[] }>('/trips')
  return data.trips || []
}

export async function upsertTrip(trip: Trip): Promise<Trip> {
  const data = await api<{ trip: Trip }>(`/trips/${encodeURIComponent(trip.id)}`, {
    method: 'PUT',
    body: JSON.stringify({ ...trip, savedByUser: true }),
  })
  return data.trip
}

export async function deleteTrip(tripId: string): Promise<Trip[]> {
  const data = await api<{ trips: Trip[] }>(`/trips/${encodeURIComponent(tripId)}`, {
    method: 'DELETE',
  })
  return data.trips || []
}

export async function purgeSampleCopies(trips: Trip[]): Promise<Trip[]> {
  const junk = trips.filter((trip) => !isPersonalTrip(trip))
  if (!junk.length) return onlyPersonalTrips(trips)
  let list = trips
  for (const row of junk) {
    list = await deleteTrip(row.id)
  }
  return onlyPersonalTrips(list)
}
