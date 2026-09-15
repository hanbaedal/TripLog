import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  KR_TOUR_BUS_CATALOG,
  resolveTourBusCity,
} from '../../src/data/krTourBusCatalog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OPEN_DATA_PATH = path.join(__dirname, '../../src/data/krTourBusOpenData.json')

let openDataCache = null

function loadOpenDataRows() {
  if (openDataCache) return openDataCache
  try {
    openDataCache = JSON.parse(fs.readFileSync(OPEN_DATA_PATH, 'utf8'))
  } catch {
    openDataCache = []
  }
  return openDataCache
}

function cleanSuffix(name) {
  return String(name || '')
    .replace(/특별자치도|특별자치시|광역시|특별시/g, '')
    .replace(/(시|군|구)$/g, '')
    .trim()
}

export function cityLabelFromRow(sido, sigungu) {
  const sidoRaw = String(sido || '').trim()
  const si = cleanSuffix(sidoRaw)
  if (/광역시|특별시|특별자치시/.test(sidoRaw) && si) return si
  const sig = cleanSuffix(sigungu)
  if (sig && sig !== '없음') return sig
  return si || sidoRaw
}

export function citySlugFromParts(sido, sigungu) {
  const label = cityLabelFromRow(sido, sigungu)
  const alias = resolveTourBusCity(label)
  if (alias) return alias
  const safe = label.replace(/\s+/g, '-')
  return `kr-${encodeURIComponent(safe)}`
}

function rowMatchesQuery(row, tokens) {
  const label = cityLabelFromRow(row.sido, row.sigungu)
  const hay = [label, row.sido, row.sigungu].join(' ').toLowerCase()
  return tokens.every((t) => hay.includes(t.toLowerCase()))
}

export function parseCityQuery(raw) {
  const bit = String(raw || '')
    .split(/[·,/]/)[0]
    .trim()
  if (!bit) return { query: '', tokens: [], slug: '' }
  const slug = resolveTourBusCity(bit) || ''
  const tokens = bit
    .replace(/(특별자치도|특별자치시|광역시|특별시|시|군|구)/g, ' ')
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return { query: bit, tokens: tokens.length ? tokens : [bit], slug }
}

function isInactiveRow(row) {
  const fare = String(row.fareText || '')
  const hours = String(row.hours || '')
  if (/미운영/.test(fare) || /미운영/.test(hours)) return true
  if (row.startTime === '00:00' && row.endTime === '00:00' && /미운영/.test(fare + row.runInfo)) return true
  return false
}

function parseFareText(text) {
  const raw = String(text || '')
  const adult = raw.match(/성인\s*([\d,]+)\s*원/i)?.[1]
  const child = raw.match(/소인\s*([\d,]+)\s*원/i)?.[1]
  return {
    fareAdult: adult ? Number(adult.replace(/,/g, '')) : undefined,
    fareChild: child ? Number(child.replace(/,/g, '')) : undefined,
  }
}

function parseHm(value) {
  const m = String(value || '').match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

function buildTimes(row) {
  const start = parseHm(row.startTime)
  const end = parseHm(row.endTime)
  const interval = Number(row.intervalMin) || 0
  if (start == null) return []
  if (end == null || end <= start || interval <= 0) {
    return [row.startTime].filter(Boolean)
  }
  const out = []
  for (let t = start; t <= end && out.length < 24; t += interval) {
    const h = Math.floor(t / 60)
    const m = t % 60
    out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return out.length ? out : [row.startTime].filter(Boolean)
}

function courseType(mode) {
  const bit = String(mode || '')
  if (bit.includes('순환')) return 'loop'
  if (bit.includes('고정') || bit.includes('패키지')) return 'package'
  return 'themed'
}

function courseId(city, index, title) {
  const base = String(title || `course-${index}`)
    .toLowerCase()
    .replace(/[^\w가-힣-]+/g, '-')
    .slice(0, 40)
  return `${city}-${index}-${base}`.replace(/-+/g, '-')
}

export function buildCityDocFromOpenRows(citySlug, cityLabel, rows) {
  const active = rows.filter((row) => !isInactiveRow(row))
  const sourceUrl = active.find((row) => row.sourceUrl)?.sourceUrl || ''
  const disclaimer =
    '공공데이터(전국시티투어정보표준데이터) 참고 일정입니다. 운행·휴무·요금·시간은 공식 사이트에서 반드시 확인하세요.'
  const courses = active.map((row, index) => {
    const { fareAdult, fareChild } = parseFareText(row.fareText)
    const noteBits = [
      row.hours ? `운영: ${row.hours}` : '',
      row.runInfo ? `운행: ${row.runInfo}` : '',
      row.fareText ? `요금: ${row.fareText}` : '',
      row.fareNote ? row.fareNote : '',
      row.contact ? `문의: ${row.contact}` : '',
      row.phone ? `전화: ${row.phone}` : '',
      row.dataDate ? `데이터 기준: ${row.dataDate}` : '',
    ].filter(Boolean)
    return {
      id: courseId(citySlug, index, row.courseName),
      title: row.courseName || `코스 ${index + 1}`,
      type: courseType(row.mode),
      operator: row.operator || row.contact || '',
      departPlace: row.departPlace || cityLabel,
      routeSummary: row.routeSummary || row.nearby || '',
      intervalMin: Number(row.intervalMin) || undefined,
      note: noteBits.join(' · '),
      fareAdult,
      fareChild,
      times: buildTimes(row),
      bookingUrl: row.sourceUrl || sourceUrl || '',
    }
  })

  return {
    city: citySlug,
    cityLabel,
    disclaimer,
    sourceUrl: sourceUrl || 'https://www.data.go.kr/data/15025456/standard.do',
    validUntil: active[0]?.dataDate || '',
    courses,
    source: 'opendata',
  }
}

export function discoverCityFromOpenData(query) {
  const parsed = parseCityQuery(query)
  if (!parsed.query) return { status: 'invalid', query: parsed.query }

  const catalogHit = parsed.slug ? KR_TOUR_BUS_CATALOG.find((row) => row.city === parsed.slug) : null
  if (catalogHit) {
    return {
      status: 'found',
      source: 'catalog',
      saved: true,
      city: catalogHit,
    }
  }

  const rows = loadOpenDataRows()
  const matched = rows.filter((row) => rowMatchesQuery(row, parsed.tokens))
  if (!matched.length) {
    return { status: 'not_found', query: parsed.query }
  }

  const label = cityLabelFromRow(matched[0].sido, matched[0].sigungu)
  const slug = citySlugFromParts(matched[0].sido, matched[0].sigungu)
  const city = buildCityDocFromOpenRows(slug, label, matched)
  if (!city.courses.length) {
    return { status: 'not_found', query: parsed.query }
  }
  return {
    status: 'found',
    source: 'opendata',
    saved: false,
    city,
  }
}

export function listOpenDataCities() {
  const rows = loadOpenDataRows()
  const map = new Map()
  for (const row of rows) {
    if (isInactiveRow(row)) continue
    const label = cityLabelFromRow(row.sido, row.sigungu)
    const slug = citySlugFromParts(row.sido, row.sigungu)
    if (!map.has(slug)) map.set(slug, { city: slug, cityLabel: label })
  }
  return [...map.values()].sort((a, b) => a.cityLabel.localeCompare(b.cityLabel, 'ko'))
}
