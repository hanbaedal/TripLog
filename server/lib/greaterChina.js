export const KR_CODES = new Set(['ICN', 'GMP'])

export const DEST_CODES = new Set([
  'CAN', 'NKG', 'NTG', 'NGB', 'DLC', 'DAT', 'LYI', 'PKX', 'PEK', 'PVG', 'SHA',
  'XMN', 'SHE', 'SZX', 'SJW', 'XIY', 'SYX', 'YTY', 'YNJ', 'YNZ', 'YNT', 'DSN',
  'URC', 'WUX', 'WUH', 'WNZ', 'WEH', 'YCU', 'JMU', 'DYG', 'CSX', 'CGO', 'TNA',
  'CGQ', 'TFU', 'CKG', 'TAO', 'KMG', 'TSN', 'FOC', 'HRB', 'HAK', 'HGH', 'HFE',
  'HLD', 'HET', 'HKG', 'MFM', 'TPE', 'KHH', 'RMQ',
])

export const TRANSFER_CODES = new Set(
  [...DEST_CODES].filter((code) => !['TPE', 'KHH', 'RMQ', 'HKG', 'MFM'].includes(code)),
)

export const CITY = {
  ICN: '서울',
  GMP: '서울',
  CAN: '광저우',
  NKG: '난징',
  NTG: '난통',
  NGB: '닝보',
  DLC: '다롄',
  DAT: '다퉁',
  LYI: '린이',
  PKX: '베이징',
  PEK: '베이징',
  PVG: '상하이',
  SHA: '상하이',
  XMN: '샤먼',
  SHE: '선양',
  SZX: '선전',
  SJW: '스자좡',
  XIY: '시안',
  SYX: '싼야',
  YTY: '양저우',
  YNJ: '옌지',
  YNZ: '옌청',
  YNT: '옌타이',
  DSN: '오르도스',
  URC: '우루무치',
  WUX: '우시',
  WUH: '우한',
  WNZ: '원저우',
  WEH: '웨이하이',
  YCU: '윈청',
  JMU: '자무쓰',
  DYG: '장가계',
  CSX: '장사',
  CGO: '정저우',
  TNA: '지난',
  CGQ: '창춘',
  TFU: '청두',
  CKG: '충칭',
  TAO: '칭다오',
  KMG: '쿤밍',
  TSN: '톈진',
  FOC: '푸저우',
  HRB: '하얼빈',
  HAK: '하이커우',
  HGH: '항저우',
  HFE: '허페이',
  HLD: '하이라얼',
  HET: '후허하오터',
  HKG: '홍콩',
  MFM: '마카오',
  TPE: '타이베이',
  KHH: '가오슝',
  RMQ: '타이중',
}

const COORDS = {
  CAN: [23.39, 113.3],
  NKG: [31.74, 118.86],
  NTG: [32.07, 120.98],
  NGB: [29.83, 121.46],
  DLC: [38.97, 121.54],
  DAT: [40.06, 113.48],
  LYI: [35.05, 118.41],
  PKX: [39.51, 116.41],
  PEK: [40.08, 116.58],
  PVG: [31.14, 121.81],
  SHA: [31.2, 121.34],
  XMN: [24.54, 118.13],
  SHE: [41.64, 123.48],
  SZX: [22.64, 113.81],
  SJW: [38.28, 114.7],
  XIY: [34.45, 108.75],
  SYX: [18.3, 109.41],
  YTY: [32.56, 119.72],
  YNJ: [42.88, 129.45],
  YNZ: [33.43, 120.2],
  YNT: [37.66, 120.98],
  DSN: [39.49, 109.86],
  URC: [43.91, 87.47],
  WUX: [31.49, 120.43],
  WUH: [30.78, 114.21],
  WNZ: [27.91, 120.85],
  WEH: [37.19, 122.23],
  YCU: [35.12, 111],
  JMU: [46.84, 130.46],
  DYG: [29.1, 110.44],
  CSX: [28.19, 113.22],
  CGO: [34.52, 113.84],
  TNA: [36.86, 117.22],
  CGQ: [43.99, 125.68],
  TFU: [30.32, 104.44],
  CKG: [29.72, 106.64],
  TAO: [36.27, 120.37],
  KMG: [25.1, 102.93],
  TSN: [39.12, 117.35],
  FOC: [25.94, 119.66],
  HRB: [45.62, 126.25],
  HAK: [19.93, 110.46],
  HGH: [30.23, 120.43],
  HFE: [31.99, 117],
  HLD: [49.21, 119.82],
  HET: [40.85, 111.82],
  HKG: [22.31, 113.91],
  MFM: [22.15, 113.59],
}

function haversineKm(a, b) {
  const toRad = (n) => (n * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)))
}

export function durationBetween(from, to) {
  if (from === to) return 60
  const p = COORDS[from]
  const q = COORDS[to]
  if (!p || !q) return 140
  const km = haversineKm(p, q)
  return Math.max(55, Math.round(km * 0.11 + 45))
}

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
