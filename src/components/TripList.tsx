import { AppNav } from './AppNav'
import type { Trip, User } from '../types'
import { formatRange } from '../lib/dates'
import { krw, summarize } from '../lib/costs'

type Props = {
  user: User | null
  trips: Trip[]
  onOpen: (trip: Trip) => void
  onNew: () => void
  onDemo: () => void
  onHome: () => void
  onAuth: () => void
  onLogout: () => void
  onDelete: (id: string) => void
}

export function TripList({ user, trips, onOpen, onNew, onDemo, onHome, onAuth, onLogout, onDelete }: Props) {
  return (
    <div>
      <AppNav
        view="trips"
        user={user}
        onHome={onHome}
        onSamples={onDemo}
        onTrips={() => undefined}
        onNewTrip={onNew}
        onAuth={onAuth}
        onLogout={onLogout}
      />

      <section className="wrap section">
        <div className="section-head">
          <h2>{user ? `${user.name}의 여행` : '저장된 여행'}</h2>
        </div>

        {trips.length === 0 ? null : (
          <div className="trip-grid">
            {trips.map((trip) => {
              const sum = summarize(trip)
              return (
                <article className="trip-card" key={trip.id}>
                  <button type="button" className="trip-card-main" onClick={() => onOpen(trip)}>
                    <div className="kicker">{trip.destination || '목적지 미정'}</div>
                    <h3>{trip.title}</h3>
                    <p className="muted">{formatRange(trip.startDate, trip.endDate)}</p>
                    <p className="cost-n" style={{ marginTop: 10 }}>{krw(sum.total)}</p>
                    <p className="muted">성인 {trip.adults}{trip.children ? ` · 소아 ${trip.children}` : ''} · {trip.items.length}개 항목</p>
                  </button>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => onDelete(trip.id)}
                  >
                    삭제
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
