import { useEffect, useRef, useState } from 'react'
import { AuthModal } from './components/AuthModal'
import { BoardPage } from './components/BoardPage'
import { GalleryPage } from './components/GalleryPage'
import { GalleryWritePage } from './components/GalleryWritePage'
import { Guidebook } from './components/Guidebook'
import { InfoPage } from './components/InfoPage'
import { InfoPlacePage } from './components/InfoPlacePage'
import { ProfilePage } from './components/ProfilePage'
import { InquiryPage } from './components/InquiryPage'
import { Landing } from './components/Landing'
import { Planner } from './components/Planner'
import { SampleGallery } from './components/SampleGallery'
import { SitemapPage } from './components/SitemapPage'
import { TaxonomyAdminPage } from './components/TaxonomyAdminPage'
import { UsersAdminPage } from './components/UsersAdminPage'
import { TripList } from './components/TripList'
import { emptyTrip } from './data/demo'
import { cloneSampleTrip, isBlankDraft, removeSample, sampleFromTrip, saveSample } from './data/samples'
import { isSupervisor, remoteMe, signOut } from './lib/auth'
import { probeRemote } from './lib/remote'
import { deleteTrip, listTrips, onlyPersonalTrips, purgeSampleCopies, upsertTrip } from './lib/trips'
import type { AppView, SiteNav } from './lib/siteNav'
import { isTaxonomyAdminView, taxonomyViewToKind } from './lib/siteNav'
import type { SampleRecord, Trip, User } from './types'

export default function App() {
  const [view, setView] = useState<AppView>('home')
  const [galleryFocus, setGalleryFocus] = useState<string | null>(null)
  const [galleryEditId, setGalleryEditId] = useState<string | null>(null)
  const [infoPlaceId, setInfoPlaceId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [trip, setTrip] = useState<Trip>(() => emptyTrip())
  const [authOpen, setAuthOpen] = useState(false)
  const [sampleEditId, setSampleEditId] = useState<string | null>(null)
  const [editingSample, setEditingSample] = useState<SampleRecord | null>(null)
  const [samplePreview, setSamplePreview] = useState(false)
  const authIntent = useRef<null | 'newTrip' | 'claimSample' | 'trips' | 'galleryWrite'>(null)
  const saveSeq = useRef(0)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [tripDirty, setTripDirty] = useState(false)
  const [guideTrip, setGuideTrip] = useState<Trip | null>(null)
  const [guideHint, setGuideHint] = useState('')

  useEffect(() => {
    void (async () => {
      await probeRemote()
      const me = await remoteMe()
      if (!me) return
      setUser(me)
      const list = await purgeSampleCopies(await listTrips())
      setTrips(list)
      if (list[0]) setTrip(list[0])
    })()
  }, [])

  useEffect(() => {
    if ((view === 'trips' || view === 'profile') && !user) setView('home')
  }, [view, user])

  async function persistTrip(next: Trip, forceMine = false, actor: User | null = user): Promise<boolean> {
    const seq = ++saveSeq.current
    try {
      if (sampleEditId && isSupervisor(actor) && !forceMine) {
        const record = sampleFromTrip(next, editingSample ?? undefined)
        record.id = sampleEditId === '__new__' ? '' : sampleEditId
        const saved = await saveSample(record)
        if (seq !== saveSeq.current) return false
        setEditingSample(saved)
        if (sampleEditId === '__new__') setSampleEditId(saved.id)
        setTrip((cur) => ({ ...cur, ...saved.trip, id: cur.id }))
        return true
      }
      if (!actor) return false
      if (!forceMine && (samplePreview || next.savedByUser === false)) return false
      if (isBlankDraft(next)) return false
      const owned = { ...next, savedByUser: true }
      const saved = await upsertTrip(owned)
      if (seq !== saveSeq.current) return false
      setTrip((cur) => (cur.id === saved.id || cur.id === owned.id ? saved : cur))
      setTrips(onlyPersonalTrips(await listTrips()))
      if (saved.publishedSampleId) {
        await saveSample(
          sampleFromTrip(saved, {
            id: saved.publishedSampleId,
            sort: 80,
            nights: 1,
            place: saved.destination || '여행',
            title: saved.title,
            destination: saved.destination,
            trip: saved,
            ownerId: actor.id,
            ownerName: actor.name,
            sourceTripId: saved.id,
          }),
        )
      }
      return true
    } catch {
      return false
    }
  }

  async function saveTripNow() {
    if (!user) {
      askAuth('newTrip')
      return
    }
    setGuideHint('')
    setSaveStatus('saving')
    const ok = await persistTrip(trip, false, user)
    if (ok) {
      setTripDirty(false)
      setSaveStatus('saved')
    } else {
      setSaveStatus('error')
    }
  }

  async function viewGuidebook() {
    setGuideHint('')
    if (!user) {
      askAuth('newTrip')
      return
    }
    if (samplePreview && !sampleEditId) {
      setGuideHint('내 여행에 저장한 뒤 안내서를 볼 수 있습니다.')
      return
    }
    if (sampleEditId) {
      setGuideHint('추천 일정 편집 중에는 안내서 보기를 사용할 수 없습니다.')
      return
    }
    if (tripDirty) {
      setGuideHint('변경 내용을 저장한 뒤 안내서를 볼 수 있습니다.')
      return
    }
    if (isBlankDraft(trip)) {
      setGuideHint('여행 이름·일정을 입력하고 저장해 주세요.')
      return
    }
    try {
      const list = onlyPersonalTrips(await listTrips())
      const saved = list.find((row) => row.id === trip.id)
      if (!saved) {
        setGuideHint('저장 버튼으로 일정을 저장한 뒤 안내서를 볼 수 있습니다.')
        return
      }
      setTrips(list)
      setGuideTrip(saved)
      setView('guide')
    } catch {
      setGuideHint('안내서를 불러오지 못했습니다.')
    }
  }

  useEffect(() => {
    if (saveStatus !== 'saved') return
    const timer = window.setTimeout(() => setSaveStatus('idle'), 2000)
    return () => window.clearTimeout(timer)
  }, [saveStatus])

  async function publishTrip(target: Trip) {
    if (!user || isBlankDraft(target)) return
    const saved = await saveSample(
      sampleFromTrip(
        { ...target, savedByUser: true },
        {
          id: target.publishedSampleId || '',
          sort: 80,
          nights: 1,
          place: target.destination || '여행',
          title: target.title,
          destination: target.destination,
          trip: target,
          ownerId: user.id,
          ownerName: user.name,
          sourceTripId: target.id,
        },
      ),
    )
    const owned = { ...target, savedByUser: true, publishedSampleId: saved.id }
    setTrip((cur) => (cur.id === owned.id ? owned : cur))
    if (await persistTrip(owned, true)) setTripDirty(false)
  }

  async function unpublishTrip(target: Trip) {
    if (!target.publishedSampleId) return
    await removeSample(target.publishedSampleId)
    const owned = { ...target, savedByUser: true, publishedSampleId: undefined }
    setTrip((cur) => (cur.id === owned.id ? owned : cur))
    if (await persistTrip(owned, true)) setTripDirty(false)
  }

  function openPlanner(next: Trip, mode: 'mine' | 'preview' = 'mine') {
    setSampleEditId(null)
    setEditingSample(null)
    setSamplePreview(mode === 'preview')
    setTripDirty(false)
    setGuideHint('')
    setSaveStatus('idle')
    setTrip(mode === 'preview' ? { ...next, savedByUser: false } : { ...next, savedByUser: true })
    setView('planner')
  }

  function handleTripChange(next: Trip) {
    if (!user) return
    setSaveStatus((cur) => (cur === 'error' ? 'idle' : cur))
    setGuideHint('')
    if (samplePreview) {
      setSamplePreview(false)
      setTripDirty(true)
      setTrip({ ...next, savedByUser: true })
      return
    }
    setTripDirty(true)
    setTrip(next)
  }

  function askAuth(intent: null | 'newTrip' | 'claimSample' | 'trips' | 'galleryWrite' = null) {
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
    const ok = await persistTrip(owned, true, actor)
    if (ok) setTripDirty(false)
    setView('trips')
  }

  async function handleAuthed(next: User) {
    const intent = authIntent.current
    authIntent.current = null
    setUser(next)
    setAuthOpen(false)
    setTrips(onlyPersonalTrips(await purgeSampleCopies(await listTrips())))
    if (intent === 'newTrip') {
      openPlanner(emptyTrip())
      return
    }
    if (intent === 'trips') {
      setView('trips')
      return
    }
    if (intent === 'galleryWrite') {
      setView('galleryWrite')
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
    setTrips([])
    setTrip(emptyTrip())
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

  function goGallery(photoId?: string) {
    setGalleryFocus(photoId ?? null)
    setView('gallery')
  }

  const nav: SiteNav = {
    view,
    user,
    go: {
      home: goHome,
      samples: goSamples,
      trips: goTrips,
      info: () => {
        setInfoPlaceId(null)
        setView('info')
      },
      infoPlace: (cityId: string) => {
        setInfoPlaceId(cityId)
        setView('infoPlace')
      },
      gallery: goGallery,
      galleryWrite: (photoId?: string) => {
        if (!user) {
          setGalleryEditId(photoId || null)
          askAuth('galleryWrite')
          return
        }
        setGalleryEditId(photoId || null)
        setView('galleryWrite')
      },
      board: () => setView('board'),
      inquiry: () => setView('inquiry'),
      sitemap: () => setView('sitemap'),
      profile: () => {
        if (!user) {
          askAuth('trips')
          return
        }
        setView('profile')
      },
      taxonomyCity: () => {
        if (!user || !isSupervisor(user)) return
        setView('taxonomyCity')
      },
      taxonomyCategory: () => {
        if (!user || !isSupervisor(user)) return
        setView('taxonomyCategory')
      },
      taxonomySightType: () => {
        if (!user || !isSupervisor(user)) return
        setView('taxonomySightType')
      },
      taxonomyFoodType: () => {
        if (!user || !isSupervisor(user)) return
        setView('taxonomyFoodType')
      },
      usersAdmin: () => {
        if (!user || !isSupervisor(user)) return
        setView('usersAdmin')
      },
      auth: () => askAuth(samplePreview && !sampleEditId ? 'claimSample' : null),
      logout: handleLogout,
    },
  }

  return (
    <>
      {view === 'home' ? (
        <Landing {...nav} onPickSample={(sample) => openPlanner(cloneSampleTrip(sample), 'preview')} />
      ) : null}
      {view === 'trips' && user ? (
        <TripList
          {...nav}
          trips={trips}
          onOpen={(next) => {
            openPlanner(next)
          }}
          onNew={startNewTrip}
          onPublish={(next) => void publishTrip(next)}
          onUnpublish={(next) => void unpublishTrip(next)}
          onDelete={(id) => {
            void (async () => {
              const target = trips.find((row) => row.id === id)
              if (target?.publishedSampleId) await removeSample(target.publishedSampleId)
              const next = await deleteTrip(id)
              setTrips(onlyPersonalTrips(next))
              if (trip.id === id) setTrip(next[0] ?? emptyTrip())
            })()
          }}
        />
      ) : null}
      {view === 'samples' ? (
        <SampleGallery
          {...nav}
          onPick={(sample) => openPlanner(cloneSampleTrip(sample), 'preview')}
          onEdit={(sample) => {
            setSamplePreview(false)
            setEditingSample(sample)
            setSampleEditId(sample.id)
            setTripDirty(true)
            setGuideHint('')
            setSaveStatus('idle')
            setTrip(sample.trip)
            setView('planner')
          }}
          onCreate={() => {
            setSamplePreview(false)
            setEditingSample(null)
            setSampleEditId('__new__')
            setTripDirty(true)
            setGuideHint('')
            setSaveStatus('idle')
            setTrip(emptyTrip())
            setView('planner')
          }}
          onUnpublish={(sample) => {
            const found = trips.find((row) => row.publishedSampleId === sample.id || row.id === sample.sourceTripId)
            if (found) {
              void unpublishTrip(found)
              return
            }
            void removeSample(sample.id)
          }}
        />
      ) : null}
      {view === 'info' ? <InfoPage {...nav} /> : null}
      {view === 'infoPlace' && infoPlaceId ? <InfoPlacePage {...nav} cityId={infoPlaceId} /> : null}
      {view === 'profile' && user ? (
        <ProfilePage {...nav} onSaved={setUser} />
      ) : null}
      {view === 'gallery' ? <GalleryPage {...nav} focusId={galleryFocus} /> : null}
      {view === 'galleryWrite' ? <GalleryWritePage {...nav} editPhotoId={galleryEditId} /> : null}
      {view === 'board' ? <BoardPage {...nav} /> : null}
      {view === 'inquiry' ? <InquiryPage {...nav} /> : null}
      {view === 'sitemap' ? <SitemapPage {...nav} /> : null}
      {isTaxonomyAdminView(view) && user && isSupervisor(user) ? (
        <TaxonomyAdminPage kind={taxonomyViewToKind(view)} {...nav} />
      ) : null}
      {view === 'usersAdmin' && user && isSupervisor(user) ? <UsersAdminPage {...nav} /> : null}
      {view === 'planner' ? (
        <Planner
          trip={trip}
          user={user}
          copyingSample={samplePreview && !sampleEditId}
          saveStatus={saveStatus}
          onChange={handleTripChange}
          onSave={user && !(samplePreview && !sampleEditId) ? () => void saveTripNow() : undefined}
          onSaveCopy={() => void saveSampleCopy()}
          nav={nav}
          guideHint={guideHint}
          onViewGuide={
            user && !(samplePreview && !sampleEditId) && !sampleEditId
              ? () => void viewGuidebook()
              : undefined
          }
          onPublish={user && !samplePreview && !sampleEditId ? () => void publishTrip(trip) : undefined}
          onUnpublish={user && !samplePreview && !sampleEditId ? () => void unpublishTrip(trip) : undefined}
        />
      ) : null}
      {view === 'guide' && user && guideTrip ? (
        <Guidebook {...nav} trip={guideTrip} onBack={() => setView('planner')} />
      ) : null}
      {authOpen ? (
        <AuthModal onClose={() => setAuthOpen(false)} onAuthed={(next) => void handleAuthed(next)} />
      ) : null}
    </>
  )
}
