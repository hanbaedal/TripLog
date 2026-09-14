/** 국내선 시범 — 김포·인천 ↔ 제주 */

const DOMESTIC_ROWS = [
  { from: 'GMP', to: 'CJU', airline: '대한항공', airlineCode: 'KE', flightNo: '1101', depart: '07:10' },
  { from: 'GMP', to: 'CJU', airline: '대한항공', airlineCode: 'KE', flightNo: '1103', depart: '10:20' },
  { from: 'GMP', to: 'CJU', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '8901', depart: '08:40' },
  { from: 'GMP', to: 'CJU', airline: '제주항공', airlineCode: '7C', flightNo: '101', depart: '09:15' },
  { from: 'GMP', to: 'CJU', airline: '제주항공', airlineCode: '7C', flightNo: '103', depart: '14:05' },
  { from: 'GMP', to: 'CJU', airline: '진에어', airlineCode: 'LJ', flightNo: '601', depart: '11:30' },
  { from: 'ICN', to: 'CJU', airline: '대한항공', airlineCode: 'KE', flightNo: '1201', depart: '08:00' },
  { from: 'ICN', to: 'CJU', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '8801', depart: '12:10' },
  { from: 'ICN', to: 'CJU', airline: '제주항공', airlineCode: '7C', flightNo: '201', depart: '16:20' },
]

function inboundNo(flightNo) {
  const n = Number(flightNo)
  return Number.isFinite(n) ? String(n + 1) : flightNo
}

export function domesticKrFlights(from, to) {
  return DOMESTIC_ROWS.filter((row) => row.from === from && row.to === to).map((row) => ({
    ...row,
    fromCity: from === 'GMP' ? '서울(김포)' : '인천',
    toCity: '제주',
    terminal: from === 'GMP' ? '국내선' : 'T1 국내',
    codeshare: false,
    durationMin: 65,
  }))
}

export function domesticKrArrivals(toAirport) {
  return DOMESTIC_ROWS.filter((row) => row.to === 'CJU' && row.from === toAirport).map((row) => ({
    airline: row.airline,
    airlineCode: row.airlineCode,
    flightNo: inboundNo(row.flightNo),
    from: 'CJU',
    to: toAirport,
    fromCity: '제주',
    toCity: toAirport === 'GMP' ? '서울(김포)' : '인천',
    depart: '18:20',
    arrive: '19:25',
    plusDay: 0,
    durationMin: 65,
    terminal: from === 'GMP' ? '국내선' : 'T1 국내',
    codeshare: false,
  }))
}

export const DOMESTIC_KR_CODES = new Set(['GMP', 'ICN', 'CJU'])
