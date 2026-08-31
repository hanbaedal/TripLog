import { CITY, TRANSFER_CODES, durationBetween } from './greaterChina.js'

const MAINLAND = [
  { code: 'CA', name: '중국국제항공' },
  { code: 'MU', name: '중국동방항공' },
  { code: 'CZ', name: '중국남방항공' },
  { code: 'HU', name: '하이난항공' },
  { code: '3U', name: '쓰촨항공' },
  { code: 'HO', name: '준야오항공' },
  { code: '9C', name: '춘추항공' },
  { code: 'ZH', name: '선전항공' },
]

const HKG_CARRIERS = [
  { code: 'CX', name: '캐세이퍼시픽항공' },
  { code: 'HX', name: '홍콩항공' },
  { code: 'CA', name: '중국국제항공' },
  { code: 'MU', name: '중국동방항공' },
]

const MFM_CARRIERS = [
  { code: 'NX', name: '에어마카오' },
  { code: 'CZ', name: '중국남방항공' },
  { code: 'CA', name: '중국국제항공' },
  { code: '9C', name: '춘추항공' },
]

const SLOTS = ['07:15', '08:40', '10:20', '12:05', '13:50', '15:35', '17:15', '19:00', '20:40']

const HUBS = new Set(['PVG', 'SHA', 'PEK', 'PKX', 'CAN', 'SZX', 'TFU', 'CKG', 'XIY', 'HGH', 'TAO', 'WUH', 'CSX', 'NKG', 'KMG', 'XMN'])

function seed(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function carriersFor(from, to) {
  if (from === 'HKG' || to === 'HKG') return HKG_CARRIERS
  if (from === 'MFM' || to === 'MFM') return MFM_CARRIERS
  return MAINLAND
}

function slotCount(from, to) {
  if (HUBS.has(from) && HUBS.has(to)) return 5
  if (HUBS.has(from) || HUBS.has(to)) return 3
  return 2
}

export function transferFlights(from, to) {
  if (!TRANSFER_CODES.has(from) || !TRANSFER_CODES.has(to) || from === to) return []
  const mins = durationBetween(from, to)
  const carriers = carriersFor(from, to)
  const n = slotCount(from, to)
  const start = seed(`${from}-${to}`) % Math.max(1, SLOTS.length - n + 1)
  const rows = []
  for (let i = 0; i < n; i++) {
    const carrier = carriers[(seed(`${from}${to}${i}`) + i) % carriers.length]
    const num = 1100 + (seed(`${carrier.code}${from}${to}${i}`) % 780)
    rows.push({
      airline: carrier.name,
      airlineCode: carrier.code,
      flightNo: String(num),
      from,
      to,
      fromCity: CITY[from] || from,
      toCity: CITY[to] || to,
      depart: SLOTS[start + i],
      durationMin: mins,
      terminal: '',
      codeshare: false,
      status: '',
    })
  }
  return rows
}
