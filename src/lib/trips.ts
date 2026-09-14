import type { Market, Trip } from '../types'
import { isPersonalTrip } from '../data/samples'
import { tripMarket } from './market'
import { api } from './remote'

export function filterTripsByMarket(trips: Trip[], market: Market): Trip[] {
  return trips.filter((row) => tripMarket(row) === market)
}

export function onlyPersonalTrips(trips: Trip[]): Trip[] {
  return trips.filter(isPersonalTrip)
}

/** 같은 여행지·같은 기간이면 하나의 여행으로 본다. */
export function tripMatchKey(trip: Trip): string | null {
  const destination = (trip.destination || '').trim()
  if (!destination || !trip.startDate || !trip.endDate) return null
  return `${destination}|${trip.startDate}|${trip.endDate}`
}

export function findMatchingTrip(trips: Trip[], trip: Trip): Trip | undefined {
  const key = tripMatchKey(trip)
  if (!key) return undefined
  return trips.find((row) => row.id !== trip.id && tripMatchKey(row) === key)
}

export async function listTrips(): Promise<Trip[]> {
  const data = await api<{ trips: Trip[] }>('/trips')
  return data.trips || []
}

export async function upsertTrip(trip: Trip): Promise<Trip> {
  const list = onlyPersonalTrips(await listTrips())
  const duplicate = findMatchingTrip(list, trip)
  const target = duplicate
    ? {
        ...trip,
        id: duplicate.id,
        savedByUser: true as const,
        publishedSampleId: trip.publishedSampleId || duplicate.publishedSampleId,
      }
    : { ...trip, savedByUser: true as const }

  const data = await api<{ trip: Trip }>(`/trips/${encodeURIComponent(target.id)}`, {
    method: 'PUT',
    body: JSON.stringify(target),
  })

  if (duplicate && trip.id !== duplicate.id) {
    const orphan = list.find((row) => row.id === trip.id)
    if (orphan && !orphan.publishedSampleId) {
      await deleteTrip(trip.id)
    }
  }

  return data.trip
}

export async function deleteTrip(tripId: string): Promise<Trip[]> {
  const data = await api<{ trips: Trip[] }>(`/trips/${encodeURIComponent(tripId)}`, {
    method: 'DELETE',
  })
  return data.trips || []
}

export async function purgeSampleCopies(trips: Trip[]): Promise<Trip[]> {
  const junk = trips.filter((trip) => trip.savedByUser === false)
  if (!junk.length) return onlyPersonalTrips(trips)
  let list = trips
  for (const row of junk) {
    list = await deleteTrip(row.id)
  }
  return onlyPersonalTrips(list)
}
