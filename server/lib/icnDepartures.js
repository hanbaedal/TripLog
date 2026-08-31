import { DEST_CODES } from './greaterChina.js'

const ENDPOINT = 'https://www.airport.kr/dep/ap_ko/getDepPasSchList.do'

function formBody(ymd) {
  const today = ymd
  const params = new URLSearchParams({
    intg: '',
    keyWord: '',
    curDate: ymd,
    startTime: '0000',
    endTime: '2359',
    todayDate: today,
    tomorrowDate: today,
    todayTime: '0000',
    curStime: '0000',
    curEtime: '2359',
    layout: '61705f6b6f40403836394040666e637431',
    siteId: 'ap_ko',
    langSe: 'ko',
    scheduleListLength: '2000',
    termId: '',
    daySel: ymd,
    fromTime: '0000',
    toTime: '2359',
    airport: '',
    airline: '',
    airplane: '',
  })
  return params.toString()
}

export function normalizeIcnRow(row) {
  const to = String(row.p1code || '').toUpperCase()
  if (!DEST_CODES.has(to)) return null
  const carrier = String(row.flightCarrier || '').toUpperCase()
  const fnumber = String(row.fnumber || '')
  const flightNo = carrier && fnumber.startsWith(carrier) ? fnumber.slice(carrier.length) : fnumber.replace(/^[A-Z0-9]{2}/, '')
  const depart = String(row.stime || '').trim()
  if (!depart || !carrier || !flightNo) return null
  const codeshare = Boolean(row.codeshare || row.codeshareFlight)
  return {
    airline: row.airlineNameKo || row.airlineNameEn || carrier,
    airlineCode: carrier,
    flightNo,
    from: 'ICN',
    to,
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
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: 'https://www.airport.kr/ap_ko/869/subview.do',
      'User-Agent': 'Mozilla/5.0 TripLog timetable cache',
    },
    body: formBody(ymd),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`인천공항 시간표 응답 ${res.status}`)
  const data = await res.json()
  const list = Array.isArray(data?.scheduleList) ? data.scheduleList : []
  return list.map(normalizeIcnRow).filter(Boolean)
}
