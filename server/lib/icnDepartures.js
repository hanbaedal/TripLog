import { DEST_CODES } from './greaterChina.js'
import { ICN_HEADERS, icnFormBody, parseIcnFlightNo } from './icnForm.js'

const ENDPOINT = 'https://www.airport.kr/dep/ap_ko/getDepPasSchList.do'

export function normalizeIcnRow(row) {
  const to = String(row.p1code || '').toUpperCase()
  if (!DEST_CODES.has(to)) return null
  const { carrier, flightNo } = parseIcnFlightNo(row)
  const depart = String(row.stime || '').trim()
  if (!depart || !carrier || !flightNo) return null
  const codeshare = Boolean(row.codeshare || row.codeshareFlight)
  return {
    airline: row.airlineNameKo || row.airlineNameEn || carrier,
    airlineCode: carrier,
    flightNo,
    from: 'ICN',
    to,
    fromCity: '서울',
    toCity: row.airportName1Ko || row.airportName1 || to,
    depart,
    terminal: row.terminal || '',
    codeshare,
    status: row.stattxt || '',
  }
}

export async function fetchIcnDay(ymd) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: ICN_HEADERS,
    body: icnFormBody(ymd),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`인천공항 출발 시간표 응답 ${res.status}`)
  const data = await res.json()
  const list = Array.isArray(data?.scheduleList) ? data.scheduleList : []
  return list.map(normalizeIcnRow).filter(Boolean)
}
