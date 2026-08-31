import { useEffect, useRef, useState } from 'react'
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
  const authIntent = useRef<null | 'newTrip' | 'claimSample' | 'trips'>(null)

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
    if (!user) return
    if (samplePreview && !sampleEditId) return
    const timer = window.setTimeout(() => {
      void persistTrip(trip)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [trip, view, user, sampleEditId, editingSample, samplePreview])

  async function persistTrip(next: Trip, forceMine = false, actor: User | null = user) {
    if (sampleEditId && isSupervisor(actor) && !forceMine) {
      const record = sampleFromTrip(next, editingSample ?? undefined)
      record.id = sampleEditId === '__new__' ? '' : sampleEditId
      const saved = await saveSample(record)
      setEditingSample(saved)
      if (sampleEditId === '__new__') setSampleEditId(saved.id)
      return
    }
    if (!actor) return
    if (!forceMine && (samplePreview || next.savedByUser === false)) return
    if (isBlankDraft(next)) return
    const owned = { ...next, savedByUser: true }
    if (isRemote()) {
      await upsertTripRemote(owned)
      setTrips(onlyPersonalTrips(await listTripsRemote()))
      return
    }
    upsertTrip(actor.id, owned)
    setTrips(onlyPersonalTrips(loadTrips(actor.id)))
  }

  function openPlanner(next: Trip, mode: 'mine' | 'preview' = 'mine') {
    setSampleEditId(null)
    setEditingSample(null)
    setSamplePreview(mode === 'preview')
    setTrip(mode === 'preview' ? { ...next, savedByUser: false } : { ...next, savedByUser: true })
    setView('planner')
  }

  function handleTripChange(next: Trip) {
    if (!user) return
    if (samplePreview) {
      setSamplePreview(false)
      setTrip({ ...next, savedByUser: true })
      return
    }
    setTrip(next)
  }

  function askAuth(intent: null | 'newTrip' | 'claimSample' | 'trips' = null) {
    authIntent.current = intent
    setAuthOpen(true)
  }

  function startNewTrip() {
    if (!user) {
      askAuth('newTrip')
      return
    }
    openPlanner(emptyTrip())
  }

  async function saveSampleCopy(actor: User | null = user) {
    if (!actor) return
    const owned = { ...trip, savedByUser: true }
    setSamplePreview(false)
    setTrip(owned)
    await persistTrip(owned, true, actor)
    setView('trips')
  }

  async function handleAuthed(next: User) {
    const intent = authIntent.current
    authIntent.current = null
    setUser(next)
    setAuthOpen(false)
    if (isRemote()) {
      await importGuestTripsRemote()
      setTrips(onlyPersonalTrips(await listTripsRemote()))
    } else {
      importGuestTrips(next.id)
      setTrips(onlyPersonalTrips(loadTrips(next.id)))
    }
    if (intent === 'newTrip') {
      openPlanner(emptyTrip())
      return
    }
    if (intent === 'trips') {
      setView('trips')
      return
    }
    if (samplePreview && !sampleEditId) {
      if (intent === 'claimSample') {
        await saveSampleCopy(next)
      }
      return
    }
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

  function goHome() {
    setView('home')
  }

  function goSamples() {
    setView('samples')
  }

  function goTrips() {
    if (!user) {
      askAuth('trips')
      return
    }
    setView('trips')
  }

  return (
    <>
      {view === 'home' ? (
        <Landing
          user={user}
          onOpenSamples={goSamples}
          onPickSample={(sample) => openPlanner(cloneSampleTrip(sample), 'preview')}
          onNewTrip={startNewTrip}
          onTrips={goTrips}
          onAuth={() => askAuth()}
          onLogout={handleLogout}
        />
      ) : null}
      {view === 'trips' ? (
        <TripList
          user={user}
          trips={trips}
          onOpen={(next) => {
            if (!user) {
              askAuth()
              return
            }
            openPlanner(next)
          }}
          onNew={startNewTrip}
          onDemo={goSamples}
          onHome={goHome}
          onAuth={() => askAuth()}
          onLogout={handleLogout}
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
          onBack={goHome}
          onTrips={goTrips}
          onNewTrip={startNewTrip}
          onAuth={() => askAuth()}
          onLogout={handleLogout}
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
          copyingSample={samplePreview && !sampleEditId}
          onChange={handleTripChange}
          onSaveCopy={() => void saveSampleCopy()}
          onHome={goHome}
          onSamples={goSamples}
          onTrips={goTrips}
          onGuide={() => setView('guide')}
          onAuth={() => askAuth(samplePreview && !sampleEditId ? 'claimSample' : null)}
        />
      ) : null}
      {view === 'guide' ? (
        <Guidebook
          trip={trip}
          onBack={() => setView('planner')}
          onHome={goHome}
          onSamples={goSamples}
          onTrips={goTrips}
        />
      ) : null}
      {authOpen ? (
        <AuthModal onClose={() => setAuthOpen(false)} onAuthed={(next) => void handleAuthed(next)} />
      ) : null}
    </>
  )
}
