import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, '../src/data/krTourBusOpenData.json')
const key = process.env.DATA_GO_KR_SERVICE_KEY || process.env.ODCLOUD_SERVICE_KEY

async function fetchOdcloud() {
  if (!key) return null
  const uddi = process.env.TOURBUS_ODCLOUD_UDDI || 'adfd55ce-4a6e-4795-877d-83d8258444c6'
  const url = new URL(`https://api.odcloud.kr/api/15025456/v1/uddi:${uddi}`)
  url.searchParams.set('serviceKey', key)
  url.searchParams.set('page', '1')
  url.searchParams.set('perPage', '5000')
  url.searchParams.set('returnType', 'JSON')
  const res = await fetch(url)
  const body = await res.json()
  if (!body.data?.length) throw new Error(`odcloud empty: ${JSON.stringify(body).slice(0, 200)}`)
  return body.data.map(normalizeOdcloudRow)
}

function normalizeOdcloudRow(row) {
  return {
    sido: row['시도명'] || '',
    sigungu: row['시군구명'] || '',
    courseName: row['시티투어코스명'] || '',
    contact: row['시티투어문의처'] || '',
    hours: row['시티투어운영시간'] || '',
    mode: row['시티투어운행방식'] || '',
    departPlace: row['시티투어탑승장소명'] || '',
    routeSummary: row['시티투어코스정보'] || '',
    nearby: row['경유지주변관광정보'] || '',
    courseNote: row['시티투어코스부가정보'] || '',
    runInfo: row['운행정보'] || '',
    startTime: row['운행시작시각'] || '',
    endTime: row['운행종료시각'] || '',
    intervalMin: String(row['배차시간'] ?? ''),
    fareText: row['이용요금'] || '',
    fareNote: row['이용요금부가정보'] || '',
    sourceUrl: row['홈페이지주소'] || '',
    operator: row['관리기관명'] || '',
    phone: row['관리기관전화번호'] || '',
    dataDate: row['데이터기준일자'] || '',
  }
}

function parseMarkdownTable(text) {
  const rows = []
  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())
    if (cells.length < 10) continue
    if (cells[0] === '시도명' || cells[0].includes('---')) continue
    rows.push({
      sido: cells[0],
      sigungu: cells[1],
      courseName: cells[2],
      contact: cells[3],
      hours: cells[4],
      mode: cells[5],
      departPlace: cells[6],
      routeSummary: cells[7],
      nearby: cells[8],
      courseNote: cells[9],
      runInfo: cells[10],
      startTime: cells[11],
      endTime: cells[12],
      intervalMin: cells[13],
      fareText: cells[14],
      fareNote: cells[15],
      sourceUrl: cells[16],
      operator: cells[17],
      phone: cells[18],
      dataDate: cells[19],
    })
  }
  return rows
}

async function fetchHtmlSample() {
  const html = await fetch('https://www.data.go.kr/data/15025456/openapi.do').then((r) => r.text())
  const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const rows = []
  const trRe = /<tr>\s*((?:<td[^>]*>[\s\S]*?<\/td>\s*){10,})<\/tr>/gi
  let m
  while ((m = trRe.exec(html))) {
    const cells = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => strip(c[1]))
    if (cells.length < 10 || cells[0] === '시도명') continue
    rows.push({
      sido: cells[0],
      sigungu: cells[1],
      courseName: cells[2],
      contact: cells[3],
      hours: cells[4],
      mode: cells[5],
      departPlace: cells[6],
      routeSummary: cells[7],
      nearby: cells[8],
      courseNote: cells[9],
      runInfo: cells[10],
      startTime: cells[11],
      endTime: cells[12],
      intervalMin: cells[13],
      fareText: cells[14],
      fareNote: cells[15],
      sourceUrl: cells[16],
      operator: cells[17],
      phone: cells[18],
      dataDate: cells[19],
    })
  }
  return rows
}

let rows = null
try {
  rows = await fetchOdcloud()
  console.log('odcloud rows', rows?.length)
} catch (err) {
  console.warn(String(err.message || err))
}

if (!rows?.length) {
  const snap = path.join(__dirname, 'tourbus-opendata-snapshot.md')
  if (fs.existsSync(snap)) {
    rows = parseMarkdownTable(fs.readFileSync(snap, 'utf8'))
    console.log('loaded snapshot markdown', rows.length)
  }
}
if (!rows?.length) {
  rows = await fetchHtmlSample()
  console.log('loaded html sample', rows.length)
}

if (!rows.length) {
  console.error('No rows')
  process.exit(1)
}

fs.writeFileSync(out, JSON.stringify(rows))
console.log(`Wrote ${rows.length} rows to ${out}`)
