import type { FlightOffer, HotelOffer, Trip, TripItem } from '../../types'
import { addDays, dayCount, dayIndexOn } from '../dates'
import { uid } from '../id'

export function ensureDate(trip: Trip, date: string): { trip: Trip; dayIndex: number } {
  let next = trip
  if (date < trip.startDate) {
    const shift = dayCount(date, trip.startDate) - 1
    next = {
      ...trip,
      startDate: date,
      items: trip.items.map((item) => ({ ...item, dayIndex: item.dayIndex + shift })),
    }
  } else if (date > trip.endDate) {
    next = { ...trip, endDate: date }
  }
  return { trip: next, dayIndex: dayIndexOn(next.startDate, date) }
}

function paxCost(unit: number, adults: number, children: number): number {
  return unit * adults + Math.round(unit * 0.75) * children
}

export function attachFlight(trip: Trip, offer: FlightOffer): Trip {
  const people = Math.max(1, trip.adults + trip.children)
  const placed = ensureDate(trip, offer.date)
  let next = placed.trip
  if (!next.destination) next = { ...next, destination: offer.toCity }
  if (next.title === '새로운 여행') next = { ...next, title: `${offer.toCity} 여행` }

  const item: TripItem = {
    id: uid('flight'),
    dayIndex: placed.dayIndex,
    time: offer.depart,
    kind: 'flight',
    title: `${offer.airlineCode}${offer.flightNo} ${offer.fromCity} → ${offer.toCity}`,
    subtitle: `${offer.airline} · ${people}인`,
    place: `${offer.from} ${offer.depart} → ${offer.to} ${offer.arrive}${offer.plusDay ? ` +${offer.plusDay}` : ''}`,
    note: `연동 검색 · ${offer.cabin} · 잔여 ${offer.seats}석 · ${offer.duration}`,
    cost: paxCost(offer.price, trip.adults, trip.children),
    source: 'connect',
  }
  return { ...next, items: [...next.items, item] }
}

export function attachHotel(
  trip: Trip,
  offer: HotelOffer,
  checkIn: string,
  checkOut: string,
): Trip {
  const nights = Math.max(1, dayCount(checkIn, checkOut) - 1)
  const rooms = Math.max(1, Math.ceil(Math.max(1, trip.adults + trip.children) / 2))
  let next = ensureDate(trip, checkIn).trip
  next = ensureDate(next, checkOut).trip
  if (!next.destination) next = { ...next, destination: offer.city }
  if (next.title === '새로운 여행') next = { ...next, title: `${offer.city} 여행` }

  const items: TripItem[] = []
  for (let i = 0; i < nights; i++) {
    const date = addDays(checkIn, i)
    const { trip: shifted, dayIndex } = ensureDate(next, date)
    next = shifted
    items.push({
      id: uid('hotel'),
      dayIndex,
      time: i === 0 ? '15:00' : '12:00',
      kind: 'hotel',
      title: offer.name,
      subtitle: `${offer.stars}성`,
      place: `${offer.city} · ${offer.area}`,
      note:
        i === 0
          ? `연동 검색 · ${nights}박 ${rooms}객실 · 평점 ${offer.rating}`
          : `${i + 1}박 차 · ${offer.amenities.slice(0, 2).join(', ')}`,
      cost: offer.nightly * rooms,
      source: 'connect',
    })
  }
  return { ...next, items: [...next.items, ...items] }
}
