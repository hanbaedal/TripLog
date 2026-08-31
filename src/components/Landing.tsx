import { useEffect, useMemo, useState } from 'react'
import { AppNav } from './AppNav'
import { SampleSlider } from './SampleSlider'
import type { SampleRecord, User } from '../types'
import { SAMPLE_CATALOG } from '../data/sampleCatalog.js'
import { listSamples } from '../data/samples'

type Props = {
  user: User | null
  onOpenSamples: () => void
  onPickSample: (sample: SampleRecord) => void
  onNewTrip: () => void
  onTrips: () => void
  onAuth: () => void
  onLogout: () => void
}

export function Landing({
  user,
  onOpenSamples,
  onPickSample,
  onNewTrip,
  onTrips,
  onAuth,
  onLogout,
}: Props) {
  const [rows, setRows] = useState<SampleRecord[]>(() => SAMPLE_CATALOG as SampleRecord[])

  useEffect(() => {
    void listSamples().then(setRows)
  }, [])

  const samples = useMemo(
    () => [...rows].sort((a, b) => a.sort - b.sort || a.nights - b.nights),
    [rows],
  )

  return (
    <div>
      <AppNav
        view="home"
        user={user}
        onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onSamples={onOpenSamples}
        onTrips={onTrips}
        onNewTrip={onNewTrip}
        onAuth={onAuth}
        onLogout={onLogout}
      />

      <section className="wrap hub">
        <div className="hub-grid">
          <button className="hub-tile sight" type="button" onClick={onOpenSamples}>
            <span className="en">Samples</span>
            <h2>샘플 일정</h2>
          </button>
          <button className="hub-tile hotel" type="button" onClick={onTrips}>
            <span className="en">My trips</span>
            <h2>내 여행</h2>
          </button>
          <button className="hub-tile move" type="button" onClick={onNewTrip}>
            <span className="en">New</span>
            <h2>새 여행</h2>
          </button>
          {user ? (
            <button className="hub-tile cost" type="button" onClick={onLogout}>
              <span className="en">Account</span>
              <h2>로그아웃</h2>
            </button>
          ) : (
            <button className="hub-tile cost" type="button" onClick={onAuth}>
              <span className="en">Sign in</span>
              <h2>로그인</h2>
            </button>
          )}
        </div>
      </section>

      <section className="samples-home">
        <SampleSlider items={samples} onPick={onPickSample} />
      </section>
    </div>
  )
}
