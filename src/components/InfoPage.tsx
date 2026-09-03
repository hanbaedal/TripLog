import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { ImagePicker } from './ImagePicker'
import { TRAVEL_INFO_CATALOG } from '../data/travelInfoCatalog.js'
import { cityGalleryId } from '../data/galleryCatalog.js'
import { citySlugFromPlace, guessSightType } from '../data/galleryTaxonomy.js'
import { canEditTravelInfo, listTravelInfo, removeTravelInfo, saveTravelInfo } from '../lib/community'
import { resolvePhotoSrc, loadGalleryPhotos, type GalleryUploadMeta } from '../lib/galleryResolve'
import type { GalleryPhoto, TravelInfo } from '../types'
import type { SiteNav } from '../lib/siteNav'

export function InfoPage(nav: SiteNav) {
  const [items, setItems] = useState<TravelInfo[]>(() =>
    (TRAVEL_INFO_CATALOG as TravelInfo[]).map((row) => ({ ...row, catalog: true })),
  )
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [editing, setEditing] = useState<TravelInfo | null>(null)
  const [writing, setWriting] = useState(false)
  const [place, setPlace] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [photoId, setPhotoId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void listTravelInfo().then(setItems)
    void loadGalleryPhotos().then(setPhotos)
  }, [])

  const cards = useMemo(
    () => [...items].sort((a, b) => (a.sort || 80) - (b.sort || 80) || a.place.localeCompare(b.place, 'ko')),
    [items],
  )

  const uploadMeta = useMemo((): GalleryUploadMeta | undefined => {
    const city = citySlugFromPlace(place) || 'dalian'
    return {
      city,
      category: 'sight',
      sightType: guessSightType(title || place) || 'town',
    }
  }, [place, title])

  function startWrite() {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    setWriting(true)
    setEditing(null)
    setPlace('')
    setTitle('')
    setBody('')
    setPhotoId('')
    setError('')
  }

  function startEdit(item: TravelInfo) {
    setWriting(true)
    setEditing(item)
    setPlace(item.place)
    setTitle(item.title)
    setBody(item.body)
    setPhotoId(item.photoId || cityGalleryId(item.id))
    setError('')
  }

  function reset() {
    setWriting(false)
    setEditing(null)
    setPlace('')
    setTitle('')
    setBody('')
    setPhotoId('')
    setError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!nav.user) {
      nav.go.auth()
      return
    }
    if (!place.trim() || !title.trim() || !body.trim() || !photoId) {
      setError('도시, 제목, 설명, 사진이 필요합니다.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const saved = await saveTravelInfo({
        id: editing?.id,
        place: place.trim(),
        title: title.trim(),
        body: body.trim(),
        photoId,
        sort: editing?.sort,
        ownerId: nav.user.id,
        ownerName: nav.user.name,
      })
      setItems((cur) => {
        const next = cur.some((row) => row.id === saved.id)
          ? cur.map((row) => (row.id === saved.id ? saved : row))
          : [...cur, saved]
        return next
      })
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('이 글을 삭제할까요?')) return
    await removeTravelInfo(id)
    setItems((cur) => cur.filter((row) => row.id !== id))
    if (editing?.id === id) reset()
  }

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>여행 정보</h2>
          <div className="nav-actions">
            <button className="btn ghost" type="button" onClick={nav.go.samples}>
              추천 일정
            </button>
            {nav.user ? (
              <button className="btn ghost" type="button" onClick={nav.go.trips}>
                내 여행
              </button>
            ) : null}
            {nav.user ? (
              <button className="btn" type="button" onClick={startWrite}>
                등록
              </button>
            ) : null}
          </div>
        </div>

        {writing ? (
          <form className="board-form" onSubmit={(e) => void submit(e)}>
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="도시·관광지" required />
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" required />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="설명" required />
            <ImagePicker
              photoId={photoId}
              onChange={setPhotoId}
              user={nav.user}
              defaultTitle={title || place}
              disabled={busy}
              uploadMeta={uploadMeta}
            />
            <div className="nav-actions">
              <button className="btn" type="submit" disabled={busy}>
                {editing ? '수정' : '등록'}
              </button>
              <button className="btn ghost" type="button" onClick={reset}>
                취소
              </button>
            </div>
            {error ? <p className="muted">{error}</p> : null}
          </form>
        ) : null}

        <div className="travel-cards">
          {cards.map((item) => (
            <article className="travel-card" key={item.id}>
              <button type="button" className="travel-card-open" onClick={() => nav.go.infoPlace(item.id)}>
                <img src={resolvePhotoSrc(item.photoId || cityGalleryId(item.id), photos, item.src)} alt="" />
                <div className="travel-card-body">
                  <p className="kicker">{item.place}</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </button>
              {item.ownerName && !item.catalog ? <p className="muted travel-card-meta">{item.ownerName}</p> : null}
              {canEditTravelInfo(item, nav.user) ? (
                <div className="nav-actions travel-card-actions">
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEdit(item)
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      void remove(item.id)
                    }}
                  >
                    삭제
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
