import { useEffect, useState } from 'react'
import { AuthModal } from './components/AuthModal'
import { Guidebook } from './components/Guidebook'
import { Landing } from './components/Landing'
import { Planner } from './components/Planner'
import { SampleGallery } from './components/SampleGallery'
import { TripList } from './components/TripList'
import { emptyTrip } from './data/demo'
import { cloneSampleTrip, sampleFromTrip, saveSample } from './data/samples'
import { currentUser, isSupervisor, remoteMe, signOut } from './lib/auth'
import { isRemote, probeRemote } from './lib/remote'
import {
  deleteTrip,
  deleteTripRemote,
  importGuestTrips,
  importGuestTripsRemote,
  listTripsRemote,
  loadTrips,
  ownerIdOf,
  upsertTrip,
  upsertTripRemote,
} from './lib/trips'
import type { SampleRecord, Trip, User } from './types'

type View = 'home' | 'trips' | 'planner' | 'guide' | 'samples'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [user, setUser] = useState<User | null>(() => currentUser())
  const owner = ownerIdOf(user?.id)
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips(owner))
  const [trip, setTrip] = useState<Trip>(() => loadTrips(owner)[0] ?? emptyTrip())
  const [authOpen, setAuthOpen] = useState(false)
  const [sampleEditId, setSampleEditId] = useState<string | null>(null)
  const [editingSample, setEditingSample] = useState<SampleRecord | null>(null)

  useEffect(() => {
    void (async () => {
      if (!(await probeRemote())) return
      const me = await remoteMe()
      if (!me) return
      setUser(me)
      const list = await listTripsRemote()
      setTrips(list)
      if (list[0]) setTrip(list[0])
    })()
  }, [])

  useEffect(() => {
    if (view !== 'planner' && view !== 'guide') return
    const timer = window.setTimeout(() => {
      void persistTrip(trip)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [trip, view, user, sampleEditId, editingSample])

  async function persistTrip(next: Trip) {
    if (sampleEditId && isSupervisor(user)) {
      const record = sampleFromTrip(next, editingSample ?? undefined)
      record.id = sampleEditId === '__new__' ? '' : sampleEditId
      const saved = await saveSample(record)
      setEditingSample(saved)
      if (sampleEditId === '__new__') setSampleEditId(saved.id)
      return
    }
    if (user && isRemote()) {
      await upsertTripRemote(next)
      setTrips(await listTripsRemote())
      return
    }
    upsertTrip(owner, next)
    setTrips(loadTrips(owner))
  }

  function openPlanner(next: Trip) {
    setSampleEditId(null)
    setEditingSample(null)
    setTrip(next)
    setView('planner')
  }

  async function handleAuthed(next: User) {
    setUser(next)
    if (isRemote()) {
      await importGuestTripsRemote()
      const list = await listTripsRemote()
      setTrips(list)
      if (list[0]) setTrip(list[0])
    } else {
      importGuestTrips(next.id)
      const list = loadTrips(next.id)
      setTrips(list)
      if (list[0]) setTrip(list[0])
    }
    setAuthOpen(false)
    setView('trips')
  }

  function handleLogout() {
    signOut()
    setUser(null)
    const list = loadTrips('guest')
    setTrips(list)
    setTrip(list[0] ?? emptyTrip())
    setView('home')
  }

  return (
    <>
      {view === 'home' ? (
        <Landing
          user={user}
          tripCount={trips.length}
          onOpenSamples={() => setView('samples')}
          onNewTrip={() => openPlanner(emptyTrip())}
          onContinue={() => {
            if (trips.length !== 1) {
              setView('trips')
              return
            }
            openPlanner(trips[0])
          }}
          onTrips={() => setView('trips')}
          onAuth={() => setAuthOpen(true)}
          onLogout={handleLogout}
        />
      ) : null}
      {view === 'trips' ? (
        <TripList
          user={user}
          trips={trips}
          onOpen={openPlanner}
          onNew={() => openPlanner(emptyTrip())}
          onDemo={() => setView('samples')}
          onHome={() => setView('home')}
          onDelete={(id) => {
            void (async () => {
              const next = user && isRemote()
                ? await deleteTripRemote(id)
                : deleteTrip(owner, id)
              setTrips(next)
              if (trip.id === id) setTrip(next[0] ?? emptyTrip())
            })()
          }}
        />
      ) : null}
      {view === 'samples' ? (
        <SampleGallery
          user={user}
          onBack={() => setView('home')}
          onPick={(sample) => openPlanner(cloneSampleTrip(sample))}
          onEdit={(sample) => {
            setEditingSample(sample)
            setSampleEditId(sample.id)
            setTrip(sample.trip)
            setView('planner')
          }}
          onCreate={() => {
            setEditingSample(null)
            setSampleEditId('__new__')
            setTrip(emptyTrip())
            setView('planner')
          }}
        />
      ) : null}
      {view === 'planner' ? (
        <Planner
          trip={trip}
          user={user}
          onChange={setTrip}
          onHome={() => setView('home')}
          onTrips={() => setView('trips')}
          onGuide={() => setView('guide')}
          onAuth={() => setAuthOpen(true)}
        />
      ) : null}
      {view === 'guide' ? (
        <Guidebook trip={trip} onBack={() => setView('planner')} />
      ) : null}
      {authOpen ? (
        <AuthModal onClose={() => setAuthOpen(false)} onAuthed={(next) => void handleAuthed(next)} />
      ) : null}
    </>
  )
}
