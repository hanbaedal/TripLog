import { Router } from 'express'
import { FlightSnap } from '../models.js'
import { fetchIcnDay } from '../lib/icnDepartures.js'
import { gmpFlights } from '../lib/gmpCatalog.js'
import {
  DEST_CODES,
  addMinutes,
  durationMin,
  formatDuration,
  seoulYmd,
  toIsoDate,
  toYmd,
} from '../lib/greaterChina.js'

export const flightsRouter = Router()

const inflight = new Map()
const TTL_MS = 50 * 60 * 1000

function seed(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function priceFor(to, date, flightId) {
  const base = 72000 + durationMin(to) * 850
  const n = seed(`${date}:${flightId}`) / 0xffffffff
  const factor = 0.84 + n * 0.42
  return Math.round((base * factor) / 1000) * 1000
}

function toOffer(row, dateIso, i) {
  const mins = durationMin(row.to)
  const arrive = addMinutes(row.depart, mins)
  const flightId = `${row.airlineCode}${row.flightNo}`
  const bits = ['직항']
  if (row.terminal) bits.push(row.terminal)
  if (row.codeshare) bits.push('공동운항')
  bits.push(`잔여 ${3 + (seed(dateIso + flightId) % 10)}석`)
  return {
    id: `${flightId}-${dateIso}-${i}`,
    airline: row.airline,
    airlineCode: row.airlineCode,
    flightNo: row.flightNo,
    from: row.from,
    to: row.to,
    fromCity: row.from === 'GMP' ? '서울' : '서울',
    toCity: row.toCity,
    date: dateIso,
    depart: row.depart,
    arrive: arrive.time,
    plusDay: arrive.plusDay,
    duration: formatDuration(mins),
    stops: 0,
    cabin: '이코노미',
    price: priceFor(row.to, dateIso, flightId),
    seats: 3 + (seed(dateIso + flightId) % 10),
    detail: bits.join(' · '),
  }
}

async function readSnap(key) {
  try {
    return await FlightSnap.findOne({ key, expireAt: { $gt: new Date() } }).lean()
  } catch {
    return null
  }
}

async function writeSnap(doc) {
  try {
    await FlightSnap.findOneAndUpdate({ key: doc.key }, doc, { upsert: true, setDefaultsOnInsert: true })
  } catch (err) {
    console.warn('flight cache skip', err.message)
  }
}

async function loadIcnDay(ymd) {
  const key = `icn:${ymd}`
  const cached = await readSnap(key)
  if (cached?.flights?.length) {
    return { flights: cached.flights, sourceDate: cached.sourceDate, live: cached.live }
  }
  if (inflight.has(key)) return inflight.get(key)
  const pending = (async () => {
    let sourceDate = ymd
    let live = true
    const today = seoulYmd()
    const t = Date.parse(`${toIsoDate(today)}T00:00:00+09:00`)
    const d = Date.parse(`${toIsoDate(ymd)}T00:00:00+09:00`)
    const diffDays = Number.isFinite(t) && Number.isFinite(d) ? (d - t) / 86400000 : 99
    const inWindow = diffDays >= -14 && diffDays <= 6
    let flights = inWindow ? await fetchIcnDay(ymd) : []
    if (!flights.length) {
      sourceDate = seoulYmd()
      live = false
      const todayKey = `icn:${sourceDate}`
      const todayCached = await readSnap(todayKey)
      if (todayCached?.flights?.length) {
        flights = todayCached.flights
      } else {
        flights = await fetchIcnDay(sourceDate)
        await writeSnap({
          key: todayKey,
          date: sourceDate,
          sourceDate,
          live: true,
          flights,
          fetchedAt: new Date(),
          expireAt: new Date(Date.now() + TTL_MS),
        })
      }
    }
    await writeSnap({
      key,
      date: ymd,
      sourceDate,
      live,
      flights,
      fetchedAt: new Date(),
      expireAt: new Date(Date.now() + TTL_MS),
    })
    return { flights, sourceDate, live }
  })().finally(() => inflight.delete(key))
  inflight.set(key, pending)
  return pending
}

flightsRouter.get('/search', async (req, res) => {
  const from = String(req.query.from || '').toUpperCase()
  const to = String(req.query.to || '').toUpperCase()
  const dateIso = String(req.query.date || '')
  const ymd = toYmd(dateIso)
  if (!/^\d{8}$/.test(ymd) || !DEST_CODES.has(to) || (from !== 'ICN' && from !== 'GMP')) {
    res.status(400).json({ error: '인천/김포에서 중국·홍콩·마카오·대만으로만 검색할 수 있습니다.' })
    return
  }

  try {
    if (from === 'GMP') {
      const offers = gmpFlights(to)
        .map((row, i) => toOffer(row, dateIso, i))
        .sort((a, b) => a.depart.localeCompare(b.depart))
      res.json({
        offers,
        notice:
          offers.length > 0
            ? '김포는 인천공항 시간표에 없어, 주요 직항 시범 시각입니다. 운임은 시범 값입니다.'
            : '김포에서 이 목적지로 가는 시범 직항이 없습니다. 인천을 골라 보세요.',
        live: false,
        sourceDate: dateIso,
      })
      return
    }

    const pack = await loadIcnDay(ymd)
    const offers = pack.flights
      .filter((row) => row.to === to)
      .map((row, i) => toOffer(row, dateIso, i))
      .sort((a, b) => a.depart.localeCompare(b.depart) || a.airline.localeCompare(b.airline, 'ko'))

    let notice = '인천공항 여객 출발 시간표입니다. 운임은 시범 값이며 발권하지 않습니다.'
    if (!pack.live) {
      notice = `인천공항 시간표는 오늘 전후 약 2주만 제공합니다. ${toIsoDate(pack.sourceDate)} 운항 패턴으로 보여 줍니다. 운임은 시범 값입니다.`
    }
    if (!offers.length) {
      notice = pack.live
        ? '이 날짜 인천공항 출발 시간표에 해당 목적지가 없습니다.'
        : `${notice} 이 목적지 편이 없습니다.`
    }

    res.json({
      offers,
      notice,
      live: pack.live,
      sourceDate: toIsoDate(pack.sourceDate),
    })
  } catch (err) {
    console.error(err)
    res.status(502).json({ error: '인천공항 시간표를 가져오지 못했습니다. 잠시 후 다시 검색해 주세요.' })
  }
})
