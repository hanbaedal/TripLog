import { useState } from 'react'
import type { FormEvent } from 'react'
import type { HotelOffer, Trip } from '../types'
import { hotelCities, searchHotels } from '../lib/connect/engine'
import { dayCount } from '../lib/dates'
import { krw } from '../lib/costs'

type Props = {
  trip: Trip
  onClose: () => void
  onManual: () => void
  onPick: (offer: HotelOffer, checkIn: string, checkOut: string) => void
}

function guessCity(destination: string): string {
  const first = destination.split(/[·,]/)[0]?.trim() ?? ''
  const cities = hotelCities()
  return cities.find((c) => first.includes(c) || c.includes(first)) ?? '오사카'
}

export function HotelSearch({ trip, onClose, onManual, onPick }: Props) {
  const [city, setCity] = useState(guessCity(trip.destination))
  const [checkIn, setCheckIn] = useState(trip.startDate)
  const [checkOut, setCheckOut] = useState(trip.endDate)
  const [rows, setRows] = useState<HotelOffer[] | null>(null)
  const [busy, setBusy] = useState(false)
  const nights = Math.max(1, dayCount(checkIn, checkOut) - 1)
  const rooms = Math.max(1, Math.ceil(Math.max(1, trip.adults + trip.children) / 2))

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      setRows(await searchHotels({ city, checkIn, nights }))
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
        aria-labelledby="hotel-search-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="hotel-search-title">호텔 검색</h2>
        <form className="search-form" onSubmit={submit}>
          <label>
            도시
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {hotelCities().map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            체크인
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
          </label>
          <label>
            체크아웃
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
          </label>
          <div className="muted" style={{ alignSelf: 'end', paddingBottom: 8 }}>
            {nights}박 · 객실 {rooms}
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? '시세 조회 중…' : '검색'}
          </button>
        </form>

        {rows ? (
          <div className="result-block">
            <div className="kicker">숙소</div>
            {rows.length === 0 ? null : (
              <div className="fare-list">
                {rows.map((hotel) => (
                  <article className="fare-card" key={hotel.id}>
                    <div>
                      <b>{hotel.name}</b>
                      <div className="muted">
                        {hotel.city} · {hotel.area} · {'★'.repeat(hotel.stars)} · {hotel.rating}
                      </div>
                      <div className="muted">{hotel.amenities.join(' · ')}</div>
                    </div>
                    <div className="fare-side">
                      <div className="cost-n">{krw(hotel.nightly)}</div>
                      <div className="muted">1박 · 객실 1</div>
                      <div className="muted">총 {krw(hotel.nightly * nights * rooms)}</div>
                      <button className="btn forest" type="button" onClick={() => onPick(hotel, checkIn, checkOut)}>
                        일정에 넣기
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
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
