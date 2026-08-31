export const DEST_CODES = new Set([
  'CAN', 'NKG', 'NTG', 'NGB', 'DLC', 'DAT', 'LYI', 'PKX', 'PEK', 'PVG', 'SHA',
  'XMN', 'SHE', 'SZX', 'SJW', 'XIY', 'SYX', 'YTY', 'YNJ', 'YNZ', 'YNT', 'DSN',
  'URC', 'WUX', 'WUH', 'WNZ', 'WEH', 'YCU', 'JMU', 'DYG', 'CSX', 'CGO', 'TNA',
  'CGQ', 'TFU', 'CKG', 'TAO', 'KMG', 'TSN', 'FOC', 'HRB', 'HAK', 'HGH', 'HFE',
  'HLD', 'HET', 'HKG', 'MFM', 'TPE', 'KHH', 'RMQ',
])

const DURATION_MIN = {
  TAO: 95, WEH: 90, YNT: 90, DLC: 100, TSN: 110, SHE: 115, YNJ: 110,
  PEK: 130, PKX: 130, PVG: 125, SHA: 120, TNA: 115, CGO: 140, TPE: 155,
  RMQ: 170, KHH: 175, HGH: 140, NKG: 135, NGB: 140, WUX: 140, HFE: 155,
  FOC: 175, XMN: 175, NTG: 140, YTY: 145, YNZ: 140, SJW: 130, DAT: 140,
  HKG: 210, MFM: 220, CAN: 220, SZX: 215, HAK: 230, SYX: 280, TFU: 270,
  CKG: 250, XIY: 220, CSX: 210, KMG: 310, URC: 360, HRB: 150, CGQ: 145,
  DYG: 210, LYI: 125, DSN: 160, YCU: 155, JMU: 170, WUH: 190, WNZ: 175,
  HLD: 165, HET: 150,
}

export function durationMin(code) {
  return DURATION_MIN[code] || 180
}

export function formatDuration(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (!h) return `${m}분`
  if (!m) return `${h}시간`
  return `${h}시간 ${m}분`
}

export function addMinutes(hhmm, mins) {
  const [h, m] = String(hhmm).split(':').map((n) => Number(n) || 0)
  const total = h * 60 + m + mins
  const plusDay = Math.floor(total / 1440)
  const rem = ((total % 1440) + 1440) % 1440
  const hh = String(Math.floor(rem / 60)).padStart(2, '0')
  const mm = String(rem % 60).padStart(2, '0')
  return { time: `${hh}:${mm}`, plusDay }
}

export function seoulYmd(date = new Date()) {
  return date
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    .replaceAll('-', '')
}

export function toYmd(isoDate) {
  return String(isoDate || '').replaceAll('-', '').slice(0, 8)
}

export function toIsoDate(ymd) {
  const s = String(ymd || '')
  if (s.length !== 8) return s
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}
