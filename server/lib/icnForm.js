export function icnFormBody(ymd) {
  const params = new URLSearchParams({
    intg: '',
    keyWord: '',
    curDate: ymd,
    startTime: '0000',
    endTime: '2359',
    todayDate: ymd,
    tomorrowDate: ymd,
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

export const ICN_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
  Referer: 'https://www.airport.kr/ap_ko/869/subview.do',
  'User-Agent': 'Mozilla/5.0 TripLog timetable cache',
}

export function parseIcnFlightNo(row) {
  const carrier = String(row.flightCarrier || '').toUpperCase()
  const fnumber = String(row.fnumber || '')
  const flightNo =
    carrier && fnumber.startsWith(carrier) ? fnumber.slice(carrier.length) : fnumber.replace(/^[A-Z0-9]{2}/, '')
  return { carrier, flightNo }
}
