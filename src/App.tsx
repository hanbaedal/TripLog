import { useEffect, useState } from 'react'
import { AuthModal } from './components/AuthModal'
import { Guidebook } from './components/Guidebook'
import { Landing } from './components/Landing'
import { Planner } from './components/Planner'
import { TripList } from './components/TripList'
import { cloneDemo, emptyTrip } from './data/demo'
import { currentUser, remoteMe, signOut } from './lib/auth'
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
import type { Trip, User } from './types'

type View = 'home' | 'trips' | 'planner' | 'guide'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [user, setUser] = useState<User | null>(() => currentUser())
  const owner = ownerIdOf(user?.id)
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips(owner))
  const [trip, setTrip] = useState<Trip>(() => loadTrips(owner)[0] ?? emptyTrip())
  const [authOpen, setAuthOpen] = useState(false)

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
  }, [trip, view, user])

  async function persistTrip(next: Trip) {
    if (user && isRemote()) {
      await upsertTripRemote(next)
      setTrips(await listTripsRemote())
      return
    }
    upsertTrip(owner, next)
    setTrips(loadTrips(owner))
  }

  function openPlanner(next: Trip) {
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
          onOpenDemo={() => openPlanner(cloneDemo())}
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
          onDemo={() => openPlanner(cloneDemo())}
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
