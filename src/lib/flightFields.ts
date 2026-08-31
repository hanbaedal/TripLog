import type { FlightFields, TripItem } from '../types'

export type FlightForm = {
  departTime: string
  departTerminal: string
  destination: string
  arriveTime: string
  arriveTerminal: string
  flightNo: string
  airline: string
}

const empty: FlightForm = {
  departTime: '09:00',
  departTerminal: '',
  destination: '',
  arriveTime: '',
  arriveTerminal: '',
  flightNo: '',
  airline: '',
}

function toHm(value: string): string {
  const m = value.match(/(\d{1,2}):(\d{2})/)
  if (!m) return ''
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

export function parseFlightForm(item?: TripItem): FlightForm {
  if (!item) return { ...empty }
  const saved = item.flight
  if (saved && (saved.flightNo || saved.destination || saved.arriveTime || saved.airline)) {
    return {
      departTime: item.time || empty.departTime,
      departTerminal: saved.departTerminal ?? '',
      destination: saved.destination ?? '',
      arriveTime: saved.arriveTime ?? '',
      arriveTerminal: saved.arriveTerminal ?? '',
      flightNo: saved.flightNo ?? '',
      airline: saved.airline ?? '',
    }
  }

  const title = item.title ?? ''
  const flightNo = title.match(/^([A-Z0-9]{2}\s?\d{2,4})/i)?.[1]?.replace(/\s+/g, '') ?? ''
  const destFromTitle = title.includes('→') ? title.split('→').slice(1).join('→').trim() : ''
  const place = item.place ?? ''
  const times = [...place.matchAll(/(\d{1,2}:\d{2})/g)].map((m) => toHm(m[1]))
  const destFromPlace = place.match(/→\s*([A-Z]{3})/)?.[1] ?? ''
  const airline = (item.subtitle ?? '').split('·')[0]?.trim() ?? ''

  return {
    departTime: item.time || times[0] || empty.departTime,
    departTerminal: '',
    destination: destFromTitle || destFromPlace,
    arriveTime: times[1] ?? '',
    arriveTerminal: '',
    flightNo,
    airline,
  }
}

export function composeFlightItem(form: FlightForm): {
  time: string
  title: string
  place?: string
  subtitle?: string
  flight: FlightFields
} {
  const flightNo = form.flightNo.trim()
  const destination = form.destination.trim()
  const airline = form.airline.trim()
  const departTerminal = form.departTerminal.trim()
  const arriveTerminal = form.arriveTerminal.trim()
  const arriveTime = form.arriveTime.trim()
  const title = [flightNo, destination].filter(Boolean).join(' → ') || '항공'
  const route = [form.departTime, arriveTime].filter(Boolean).join(' → ')
  const terminals = [
    departTerminal ? `출발 ${departTerminal}` : '',
    arriveTerminal ? `도착 ${arriveTerminal}` : '',
  ].filter(Boolean)
  const place = [destination, route, ...terminals].filter(Boolean).join(' · ') || undefined
  return {
    time: form.departTime || empty.departTime,
    title,
    place,
    subtitle: airline || undefined,
    flight: {
      departTerminal: departTerminal || undefined,
      destination: destination || undefined,
      arriveTime: arriveTime || undefined,
      arriveTerminal: arriveTerminal || undefined,
      flightNo: flightNo || undefined,
      airline: airline || undefined,
    },
  }
}
