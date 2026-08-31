import { CITY, DEST_CODES, addMinutes, durationMin } from './greaterChina.js'
import { ICN_HEADERS, icnFormBody, parseIcnFlightNo } from './icnForm.js'

const ENDPOINT = 'https://www.airport.kr/arr/ap_ko/getArrPasSchList.do'

export function normalizeIcnArrRow(row) {
  const from = String(row.p1code || '').toUpperCase()
  if (!DEST_CODES.has(from)) return null
  const { carrier, flightNo } = parseIcnFlightNo(row)
  const arrive = String(row.stime || '').trim()
  if (!arrive || !carrier || !flightNo) return null
  const mins = durationMin(from)
  const back = addMinutes(arrive, -mins)
  return {
    airline: row.airlineNameKo || row.airlineNameEn || carrier,
    airlineCode: carrier,
    flightNo,
    from,
    to: 'ICN',
    fromCity: CITY[from] || row.airportName1Ko || from,
    toCity: '서울',
    depart: back.time,
    arrive,
    plusDay: 0,
    prevDayDepart: back.plusDay < 0,
    durationMin: mins,
    terminal: row.terminal || '',
    codeshare: Boolean(row.codeshare || row.codeshareFlight),
    status: row.stattxt || '',
  }
}

export async function fetchIcnArrivals(ymd) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: ICN_HEADERS,
    body: icnFormBody(ymd),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`인천공항 도착 시간표 응답 ${res.status}`)
  const data = await res.json()
  const list = Array.isArray(data?.scheduleList) ? data.scheduleList : []
  return list.map(normalizeIcnArrRow).filter(Boolean)
}
