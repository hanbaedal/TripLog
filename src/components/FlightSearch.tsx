import { useState } from 'react'
import type { FormEvent } from 'react'
import type { FlightOffer, Trip } from '../types'
import { groupedAirports, searchFlights } from '../lib/connect/engine'
import { krw } from '../lib/costs'

type Props = {
  trip: Trip
  onClose: () => void
  onManual: () => void
  onPick: (offer: FlightOffer) => void
}

export function FlightSearch({ trip, onClose, onManual, onPick }: Props) {
  const [from, setFrom] = useState('ICN')
  const [to, setTo] = useState('KIX')
  const [date, setDate] = useState(trip.startDate)
  const [returnDate, setReturnDate] = useState(trip.endDate)
  const [out, setOut] = useState<FlightOffer[] | null>(null)
  const [back, setBack] = useState<FlightOffer[] | null>(null)
  const [busy, setBusy] = useState(false)
  const groups = groupedAirports()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (from === to) return
    setBusy(true)
    try {
      const going = await searchFlights({ from, to, date })
      setOut(going)
      setBack(await searchFlights({ from: to, to: from, date: returnDate }))
    } finally {
      setBusy(false)
    }
  }

  function selectOptions() {
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

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div
        className="modal sheet-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="flight-search-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kicker">Connect · Flights</div>
        <h2 id="flight-search-title">항공 검색</h2>
        <p className="muted" style={{ margin: '6px 0 14px' }}>
          노선과 날짜를 넣으면 시범 연동 운임이 나옵니다. 고른 편은 일정·비용에 바로 붙습니다.
        </p>
        <form className="search-form flight-search-form" onSubmit={submit}>
          <label>
            출발
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              {selectOptions()}
            </select>
          </label>
          <label>
            도착
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {selectOptions()}
            </select>
          </label>
          <label>
            가는 날
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            오는 날
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </label>
          <div className="search-actions">
            <button className="btn" type="submit" disabled={busy || from === to}>
              {busy ? '시세 조회 중…' : '검색'}
            </button>
          </div>
        </form>

        {out ? (
          <ResultList title="가는 편" offers={out} onPick={onPick} />
        ) : null}
        {back ? (
          <ResultList title="오는 편" offers={back} onPick={onPick} />
        ) : null}

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
  return (
    <div className="result-block">
      <div className="kicker">{title}</div>
      {offers.length === 0 ? (
        <p className="muted">이 구간은 아직 시범 노선이 없습니다. 다른 공항을 고르거나 직접 입력해 주세요.</p>
      ) : (
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
                  {offer.duration} · 직항 · 잔여 {offer.seats}석
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
      )}
    </div>
  )
}
