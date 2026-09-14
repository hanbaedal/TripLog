import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Airport } from '../data/airports'
import { DEST_AIRPORTS, CHINA_LOCAL_AIRPORTS, DOMESTIC_AIRPORTS } from '../data/airports'
import type { FlightOffer, Trip } from '../types'
import {
  groupedChinaLocalAirports,
  groupedDestinations,
  groupedOrigins,
  searchFlights,
  type FlightLeg,
} from '../lib/connect/engine'
import { krw } from '../lib/costs'

type Props = {
  trip: Trip
  focusDate?: string
  onClose: () => void
  onManual: () => void
  onPick: (offer: FlightOffer) => void
}

const LEGS_CN: { id: FlightLeg; label: string }[] = [
  { id: 'outbound', label: '출국' },
  { id: 'transfer', label: '환승' },
  { id: 'return', label: '귀국' },
]

const LEGS_KR: { id: FlightLeg; label: string; domesticReturn?: boolean }[] = [
  { id: 'domestic', label: '가는 편' },
  { id: 'domestic', label: '오는 편', domesticReturn: true },
]

const COPY: Record<
  FlightLeg,
  { dateLabel: string; results: string; fromLabel: string; toLabel: string }
> = {
  outbound: {
    dateLabel: '가는 날',
    results: '출발 시간표',
    fromLabel: '출발',
    toLabel: '도착',
  },
  transfer: {
    dateLabel: '타는 날',
    results: '환승 시간표',
    fromLabel: '출발',
    toLabel: '도착',
  },
  return: {
    dateLabel: '오는 날',
    results: '도착 시간표',
    fromLabel: '출발',
    toLabel: '도착',
  },
  domestic: {
    dateLabel: '가는 날',
    results: '국내선 시간표',
    fromLabel: '출발',
    toLabel: '도착',
  },
}

function krAirportGroups(returnLeg: boolean, side: 'from' | 'to') {
  const mainland = DOMESTIC_AIRPORTS.filter((a) => a.code !== 'CJU')
  const jeju = DOMESTIC_AIRPORTS.filter((a) => a.code === 'CJU')
  const list =
    side === 'from'
      ? returnLeg
        ? jeju
        : mainland
      : returnLeg
        ? mainland
        : jeju
  return [['한국', list]] as ReturnType<typeof groupedOrigins>
}

function selectOptions(groups: ReturnType<typeof groupedOrigins>) {
  return groups.map(([country, list]) => (
    <optgroup key={country} label={country}>
      {list.map((a) => (
        <option key={a.code} value={a.code}>
          {a.city} {a.name} ({a.code})
        </option>
      ))}
    </optgroup>
  ))
}

function matchAirport(text: string, list: Airport[]) {
  const t = text.trim()
  if (!t) return undefined
  return list.find((a) => t.includes(a.city) || a.city.includes(t) || t.includes(a.name))
}

function otherChina(from: string) {
  if (from === 'PEK' || from === 'PKX') return 'PVG'
  return 'PEK'
}

function hasCode(list: Airport[], code: string) {
  return list.some((a) => a.code === code)
}

function defaultsFor(
  leg: FlightLeg,
  trip: Trip,
  focusDate: string | undefined,
  prevFrom: string,
  prevTo: string,
) {
  const destHit = matchAirport(trip.destination, DEST_AIRPORTS)
  const localHit = matchAirport(trip.destination, CHINA_LOCAL_AIRPORTS)

  if (leg === 'outbound') {
    return {
      from: 'ICN',
      to: hasCode(DEST_AIRPORTS, prevTo)
        ? prevTo
        : hasCode(DEST_AIRPORTS, prevFrom)
          ? prevFrom
          : destHit?.code || 'PVG',
      date: trip.startDate,
    }
  }

  if (leg === 'transfer') {
    const from = hasCode(CHINA_LOCAL_AIRPORTS, prevTo)
      ? prevTo
      : hasCode(CHINA_LOCAL_AIRPORTS, prevFrom)
        ? prevFrom
        : localHit?.code || 'PVG'
    const toCandidate =
      hasCode(CHINA_LOCAL_AIRPORTS, prevTo) && prevTo !== from ? prevTo : otherChina(from)
    const to = toCandidate === from ? otherChina(from) : toCandidate
    return { from, to, date: focusDate || trip.startDate }
  }

  const from = hasCode(CHINA_LOCAL_AIRPORTS, prevFrom)
    ? prevFrom
    : hasCode(CHINA_LOCAL_AIRPORTS, prevTo)
      ? prevTo
      : localHit?.code || 'PVG'
  return { from, to: 'ICN', date: trip.endDate }
}

export function FlightSearch({ trip, focusDate, onClose, onManual, onPick }: Props) {
  const isKr = trip.market === 'kr'
  const [leg, setLeg] = useState<FlightLeg>(isKr ? 'domestic' : 'outbound')
  const [domesticReturn, setDomesticReturn] = useState(false)
  const [from, setFrom] = useState(isKr ? 'GMP' : 'ICN')
  const [to, setTo] = useState(
    isKr ? 'CJU' : matchAirport(trip.destination, DEST_AIRPORTS)?.code || 'PVG',
  )
  const [date, setDate] = useState(trip.startDate)
  const [out, setOut] = useState<FlightOffer[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const origins = groupedOrigins()
  const dests = groupedDestinations()
  const chinaLocal = groupedChinaLocalAirports()
  const copy = isKr
    ? {
        ...COPY.domestic,
        dateLabel: domesticReturn ? '오는 날' : '가는 날',
      }
    : COPY[leg]
  const fromGroups = isKr
    ? krAirportGroups(domesticReturn, 'from')
    : leg === 'outbound'
      ? origins
      : chinaLocal
  const toGroups = isKr
    ? krAirportGroups(domesticReturn, 'to')
    : leg === 'outbound'
      ? dests
      : leg === 'transfer'
        ? chinaLocal
        : origins

  function switchLeg(next: FlightLeg, returnLeg = false) {
    if (isKr) {
      setDomesticReturn(returnLeg)
      if (returnLeg) {
        setFrom('CJU')
        setTo('GMP')
        setDate(trip.endDate)
      } else {
        setFrom('GMP')
        setTo('CJU')
        setDate(trip.startDate)
      }
      setLeg('domestic')
      setOut(null)
      return
    }
    if (next === leg) return
    const nextVals = defaultsFor(next, trip, focusDate, from, to)
    setLeg(next)
    setFrom(nextVals.from)
    setTo(nextVals.to)
    setDate(nextVals.date)
    setOut(null)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (from === to) return
    setBusy(true)
    try {
      const result = await searchFlights({ from, to, date, leg: isKr ? 'domestic' : leg })
      setOut(result.offers)
      setNotice(result.notice || '')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div
        className="modal sheet-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="flight-search-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="flight-search-title">항공 검색</h2>
        <div className="leg-tabs" role="group" aria-label="항공 구간">
          {(isKr ? LEGS_KR : LEGS_CN).map((item, index) => {
            const returnLeg = 'domesticReturn' in item ? Boolean(item.domesticReturn) : false
            return (
              <button
                key={`${item.id}-${index}`}
                type="button"
                className={
                  isKr
                    ? domesticReturn === returnLeg
                      ? 'btn'
                      : 'btn ghost'
                    : leg === item.id
                      ? 'btn'
                      : 'btn ghost'
                }
                aria-pressed={isKr ? domesticReturn === returnLeg : leg === item.id}
                onClick={() => switchLeg(item.id, returnLeg)}
              >
                {item.label}
              </button>
            )
          })}
        </div>
        {isKr ? (
          <p className="muted flight-kr-tip">
            국내선은 김포·인천 ↔ 제주 시범 시간표입니다. 제주 외 권역은 KTX·렌터카·고속버스로 일정에 넣어 주세요.
          </p>
        ) : null}
        <form className="search-form flight-search-form" onSubmit={submit}>
          <label>
            {copy.fromLabel}
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              {selectOptions(fromGroups)}
            </select>
          </label>
          <label>
            {copy.toLabel}
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {selectOptions(toGroups)}
            </select>
          </label>
          <label>
            {copy.dateLabel}
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <div className="search-actions">
            <button className="btn" type="submit" disabled={busy || from === to}>
              {busy ? '시간표 조회 중…' : '검색'}
            </button>
          </div>
        </form>

        {notice ? <p className="muted flight-notice">{notice}</p> : null}

        {out ? <ResultList title={copy.results} offers={out} onPick={onPick} /> : null}

        <div className="modal-actions">
          <button className="btn ghost" type="button" onClick={onManual}>
            직접 입력
          </button>
          <button className="btn ghost" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

function ResultList({
  title,
  offers,
  onPick,
}: {
  title: string
  offers: FlightOffer[]
  onPick: (offer: FlightOffer) => void
}) {
  if (offers.length === 0) return null
  return (
    <div className="result-block">
      <div className="kicker">{title}</div>
      <div className="fare-list">
          {offers.map((offer) => (
            <article className="fare-card" key={offer.id}>
              <div>
                <b>
                  {offer.airlineCode}
                  {offer.flightNo}
                </b>
                <span className="muted"> {offer.airline}</span>
                <div className="fare-route">
                  <strong>{offer.depart}</strong> {offer.from}
                  <span className="dash-mini" />
                  <strong>
                    {offer.arrive}
                    {offer.plusDay ? <sup>+{offer.plusDay}</sup> : null}
                  </strong>{' '}
                  {offer.to}
                </div>
                <div className="muted">
                  {offer.duration} · {offer.detail || `직항 · 잔여 ${offer.seats}석`}
                </div>
              </div>
              <div className="fare-side">
                <div className="cost-n">{krw(offer.price)}</div>
                <div className="muted">1인</div>
                <button className="btn" type="button" onClick={() => onPick(offer)}>
                  일정에 넣기
                </button>
              </div>
            </article>
          ))}
        </div>
    </div>
  )
}
