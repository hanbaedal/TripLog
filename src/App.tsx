import { useEffect, useState } from 'react'
import { AuthModal } from './components/AuthModal'
import { Guidebook } from './components/Guidebook'
import { Landing } from './components/Landing'
import { Planner } from './components/Planner'
import { SampleGallery } from './components/SampleGallery'
import { TripList } from './components/TripList'
import { emptyTrip } from './data/demo'
import { cloneSampleTrip, isBlankDraft, sampleFromTrip, saveSample } from './data/samples'
import { currentUser, isSupervisor, remoteMe, signOut } from './lib/auth'
import { isRemote, probeRemote } from './lib/remote'
import {
  deleteTrip,
  deleteTripRemote,
  importGuestTrips,
  importGuestTripsRemote,
  listTripsRemote,
  loadTrips,
  onlyPersonalTrips,
  ownerIdOf,
  purgeSampleCopies,
  upsertTrip,
  upsertTripRemote,
} from './lib/trips'
import type { SampleRecord, Trip, User } from './types'

type View = 'home' | 'trips' | 'planner' | 'guide' | 'samples'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [user, setUser] = useState<User | null>(() => currentUser())
  const owner = ownerIdOf(user?.id)
  const [trips, setTrips] = useState<Trip[]>(() => onlyPersonalTrips(loadTrips(owner)))
  const [trip, setTrip] = useState<Trip>(() => onlyPersonalTrips(loadTrips(owner))[0] ?? emptyTrip())
  const [authOpen, setAuthOpen] = useState(false)
  const [sampleEditId, setSampleEditId] = useState<string | null>(null)
  const [editingSample, setEditingSample] = useState<SampleRecord | null>(null)
  const [samplePreview, setSamplePreview] = useState(false)

  useEffect(() => {
    void (async () => {
      if (!(await probeRemote())) {
        const kept = await purgeSampleCopies(loadTrips(owner), false, owner)
        setTrips(kept)
        return
      }
      const me = await remoteMe()
      if (!me) {
        const kept = await purgeSampleCopies(loadTrips(owner), false, owner)
        setTrips(kept)
        return
      }
      setUser(me)
      const list = await purgeSampleCopies(await listTripsRemote(), true, me.id)
      setTrips(list)
      if (list[0]) setTrip(list[0])
    })()
  }, [])

  useEffect(() => {
    if (view !== 'planner' && view !== 'guide') return
    if (samplePreview && !sampleEditId) return
    const timer = window.setTimeout(() => {
      void persistTrip(trip)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [trip, view, user, sampleEditId, editingSample, samplePreview])

  async function persistTrip(next: Trip) {
    if (sampleEditId && isSupervisor(user)) {
      const record = sampleFromTrip(next, editingSample ?? undefined)
      record.id = sampleEditId === '__new__' ? '' : sampleEditId
      const saved = await saveSample(record)
      setEditingSample(saved)
      if (sampleEditId === '__new__') setSampleEditId(saved.id)
      return
    }
    if (samplePreview || next.savedByUser === false) return
    if (isBlankDraft(next)) return
    const owned = { ...next, savedByUser: true }
    if (user && isRemote()) {
      await upsertTripRemote(owned)
      setTrips(onlyPersonalTrips(await listTripsRemote()))
      return
    }
    upsertTrip(owner, owned)
    setTrips(onlyPersonalTrips(loadTrips(owner)))
  }

  function openPlanner(next: Trip, mode: 'mine' | 'preview' = 'mine') {
    setSampleEditId(null)
    setEditingSample(null)
    setSamplePreview(mode === 'preview')
    setTrip(mode === 'preview' ? { ...next, savedByUser: false } : { ...next, savedByUser: true })
    setView('planner')
  }

  function handleTripChange(next: Trip) {
    if (samplePreview) {
      setSamplePreview(false)
      setTrip({ ...next, savedByUser: true })
      return
    }
    setTrip(next)
  }

  async function handleAuthed(next: User) {
    setUser(next)
    if (isRemote()) {
      await importGuestTripsRemote()
      const list = onlyPersonalTrips(await listTripsRemote())
      setTrips(list)
      if (list[0]) setTrip(list[0])
    } else {
      importGuestTrips(next.id)
      const list = onlyPersonalTrips(loadTrips(next.id))
      setTrips(list)
      if (list[0]) setTrip(list[0])
    }
    setAuthOpen(false)
    setView('trips')
  }

  function handleLogout() {
    signOut()
    setUser(null)
    const list = onlyPersonalTrips(loadTrips('guest'))
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
          onPickSample={(sample) => openPlanner(cloneSampleTrip(sample), 'preview')}
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
              setTrips(onlyPersonalTrips(next))
              if (trip.id === id) setTrip(next[0] ?? emptyTrip())
            })()
          }}
        />
      ) : null}
      {view === 'samples' ? (
        <SampleGallery
          user={user}
          onBack={() => setView('home')}
          onPick={(sample) => openPlanner(cloneSampleTrip(sample), 'preview')}
          onEdit={(sample) => {
            setSamplePreview(false)
            setEditingSample(sample)
            setSampleEditId(sample.id)
            setTrip(sample.trip)
            setView('planner')
          }}
          onCreate={() => {
            setSamplePreview(false)
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
          onChange={handleTripChange}
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
