import { Router } from 'express'
import mongoose from 'mongoose'
import { FlightSnap } from '../models.js'
import { fetchIcnDay } from '../lib/icnDepartures.js'
import { fetchIcnArrivals } from '../lib/icnArrivals.js'
import { gmpArrivals, gmpFlights } from '../lib/gmpCatalog.js'
import { transferFlights } from '../lib/transferCatalog.js'
import {
  CITY,
  DEST_CODES,
  KR_CODES,
  TRANSFER_CODES,
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

function priceFor(mins, date, flightId, domestic) {
  const base = domestic ? 28000 + mins * 380 : 72000 + mins * 850
  const n = seed(`${date}:${flightId}`) / 0xffffffff
  const factor = 0.84 + n * 0.42
  return Math.round((base * factor) / 1000) * 1000
}

function toOffer(row, dateIso, i, domestic = false) {
  const mins =
    row.durationMin ??
    durationMin(KR_CODES.has(row.to) ? row.from : row.to)
  const computed = addMinutes(row.depart, mins)
  const arrive = row.arrive || computed.time
  const plusDay = row.plusDay ?? computed.plusDay
  const flightId = `${row.airlineCode}${row.flightNo}`
  const bits = ['직항']
  if (row.terminal) bits.push(row.terminal)
  if (row.codeshare) bits.push('공동운항')
  if (row.prevDayDepart) bits.push('전날 출발')
  bits.push(`잔여 ${3 + (seed(dateIso + flightId) % 10)}석`)
  return {
    id: `${flightId}-${dateIso}-${row.from}${row.to}-${i}`,
    airline: row.airline,
    airlineCode: row.airlineCode,
    flightNo: row.flightNo,
    from: row.from,
    to: row.to,
    fromCity: row.fromCity || CITY[row.from] || row.from,
    toCity: row.toCity || CITY[row.to] || row.to,
    date: dateIso,
    depart: row.depart,
    arrive,
    plusDay,
    duration: formatDuration(mins),
    stops: 0,
    cabin: '이코노미',
    price: priceFor(mins, dateIso, flightId, domestic),
    seats: 3 + (seed(dateIso + flightId) % 10),
    detail: bits.join(' · '),
    terminal: row.terminal || '',
  }
}

async function readSnap(key) {
  if (mongoose.connection.readyState !== 1) return null
  try {
    return await FlightSnap.findOne({ key, expireAt: { $gt: new Date() } }).lean()
  } catch {
    return null
  }
}

async function writeSnap(doc) {
  if (mongoose.connection.readyState !== 1) return
  try {
    await FlightSnap.findOneAndUpdate({ key: doc.key }, doc, { upsert: true, setDefaultsOnInsert: true })
  } catch (err) {
    console.warn('flight cache skip', err.message)
  }
}

async function loadIcnBoard(ymd, kind) {
  const prefix = kind === 'arr' ? 'icn-arr' : 'icn'
  const fetchFn = kind === 'arr' ? fetchIcnArrivals : fetchIcnDay
  const key = `${prefix}:${ymd}`
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
    let flights = inWindow ? await fetchFn(ymd) : []
    if (!flights.length) {
      sourceDate = seoulYmd()
      live = false
      const todayKey = `${prefix}:${sourceDate}`
      const todayCached = await readSnap(todayKey)
      if (todayCached?.flights?.length) {
        flights = todayCached.flights
      } else {
        flights = await fetchFn(sourceDate)
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

function inferLeg(from, to) {
  if (KR_CODES.has(from) && DEST_CODES.has(to)) return 'outbound'
  if (TRANSFER_CODES.has(from) && KR_CODES.has(to)) return 'return'
  if (TRANSFER_CODES.has(from) && TRANSFER_CODES.has(to)) return 'transfer'
  return ''
}

flightsRouter.get('/search', async (req, res) => {
  const from = String(req.query.from || '').toUpperCase()
  const to = String(req.query.to || '').toUpperCase()
  const dateIso = String(req.query.date || '')
  const ymd = toYmd(dateIso)
  const requested = String(req.query.leg || '').toLowerCase()
  const leg = requested || inferLeg(from, to)

  if (!/^\d{8}$/.test(ymd) || from === to) {
    res.status(400).json({ error: '출발·도착 공항과 날짜를 확인해 주세요.' })
    return
  }

  const outboundOk = leg === 'outbound' && KR_CODES.has(from) && DEST_CODES.has(to)
  const returnOk = leg === 'return' && TRANSFER_CODES.has(from) && KR_CODES.has(to)
  const transferOk = leg === 'transfer' && TRANSFER_CODES.has(from) && TRANSFER_CODES.has(to)

  if (!outboundOk && !returnOk && !transferOk) {
    res.status(400).json({
      error:
        '출국은 인천/김포→중국권, 환승은 중국 현지공항끼리, 귀국은 중국 현지공항→인천/김포만 검색할 수 있습니다.',
    })
    return
  }

  try {
    if (leg === 'transfer') {
      const offers = transferFlights(from, to)
        .map((row, i) => toOffer(row, dateIso, i, true))
        .sort((a, b) => a.depart.localeCompare(b.depart) || a.airline.localeCompare(b.airline, 'ko'))
      res.json({
        offers,
        notice:
          '중국 현지공항 사이 환승은 실시간 시간표가 아니라 주요 운항 패턴 시범 시각입니다. 운임도 시범 값이며 발권하지 않습니다.',
        live: false,
        sourceDate: dateIso,
      })
      return
    }

    if (from === 'GMP' || to === 'GMP') {
      const rows = from === 'GMP' ? gmpFlights(to) : gmpArrivals(from)
      const offers = rows
        .map((row, i) => toOffer(row, dateIso, i))
        .sort((a, b) => a.depart.localeCompare(b.depart))
      res.json({
        offers,
        notice:
          offers.length > 0
            ? '김포는 인천공항 시간표에 없어, 주요 직항 시범 시각입니다. 운임은 시범 값입니다.'
            : '김포 시범 직항이 없는 구간입니다. 인천을 골라 보세요.',
        live: false,
        sourceDate: dateIso,
      })
      return
    }

    if (leg === 'return') {
      const pack = await loadIcnBoard(ymd, 'arr')
      const offers = pack.flights
        .filter((row) => row.from === from)
        .map((row, i) => toOffer(row, dateIso, i))
        .sort((a, b) => (a.arrive || a.depart).localeCompare(b.arrive || b.depart) || a.airline.localeCompare(b.airline, 'ko'))

      let notice = '인천공항 여객 도착 시간표입니다. 출발 시각은 비행시간으로 추정합니다. 운임은 시범 값이며 발권하지 않습니다.'
      if (!pack.live) {
        notice = `인천공항 시간표는 오늘 전후 약 2주만 제공합니다. ${toIsoDate(pack.sourceDate)} 운항 패턴으로 보여 줍니다. 운임은 시범 값입니다.`
      }
      if (!offers.length) {
        notice = pack.live
          ? '이 날짜 인천공항 도착 시간표에 해당 출발지가 없습니다.'
          : `${notice} 이 출발지 편이 없습니다.`
      }

      res.json({
        offers,
        notice,
        live: pack.live,
        sourceDate: toIsoDate(pack.sourceDate),
      })
      return
    }

    const pack = await loadIcnBoard(ymd, 'dep')
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
    res.status(502).json({ error: '항공 시간표를 가져오지 못했습니다. 잠시 후 다시 검색해 주세요.' })
  }
})
