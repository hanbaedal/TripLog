import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import {
  canEditTravelSpot,
  findTravelInfo,
  listTravelSpots,
  removeTravelSpot,
  saveTravelSpot,
} from '../lib/community'
import { compressImage } from '../lib/imageFile'
import { mapSearchLinks } from '../lib/mapLinks'
import type { TravelInfo, TravelSpot } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  cityId: string
}

export function InfoPlacePage({ cityId, ...nav }: Props) {
  const [city, setCity] = useState<TravelInfo | null>(null)
  const [spots, setSpots] = useState<TravelSpot[]>([])
  const [writing, setWriting] = useState(false)
  const [editing, setEditing] = useState<TravelSpot | null>(null)
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [tip, setTip] = useState('')
  const [src, setSrc] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void findTravelInfo(cityId).then((row) => setCity(row ?? null))
    void listTravelSpots(cityId).then(setSpots)
  }, [cityId])

  const cards = useMemo(
    () => [...spots].sort((a, b) => (a.sort || 80) - (b.sort || 80) || a.name.localeCompare(b.name, 'ko')),
    [spots],
  )

  function reset() {
    setWriting(false)
    setEditing(null)
    setName('')
    setBody('')
    setTip('')
    setSrc('')
    setError('')
  }

  function startWrite() {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    setWriting(true)
    setEditing(null)
    setName('')
    setBody('')
    setTip('')
    setSrc(city?.src || '')
    setError('')
  }

  function startEdit(spot: TravelSpot) {
    setWriting(true)
    setEditing(spot)
    setName(spot.name)
    setBody(spot.body)
    setTip(spot.tip)
    setSrc(spot.src)
    setError('')
  }

  async function onFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      setSrc(await compressImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : '사진을 읽지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!nav.user) {
      nav.go.auth()
      return
    }
    if (!name.trim() || !body.trim() || !src) {
      setError('이름, 설명, 사진이 필요합니다.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const saved = await saveTravelSpot({
        id: editing?.id,
        cityId,
        name: name.trim(),
        body: body.trim(),
        tip: tip.trim(),
        src,
        sort: editing?.sort,
        ownerId: nav.user.id,
        ownerName: nav.user.name,
      })
      setSpots((cur) => {
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
    if (!window.confirm('이 관광지를 삭제할까요?')) return
    await removeTravelSpot(id)
    setSpots((cur) => cur.filter((row) => row.id !== id))
    if (editing?.id === id) reset()
  }

  if (!city) {
    return (
      <PageShell {...nav}>
        <section className="wrap section">
          <div className="section-head">
            <h2>여행 정보</h2>
            <button className="btn ghost" type="button" onClick={nav.go.info}>
              목록
            </button>
          </div>
        </section>
      </PageShell>
    )
  }

  const place = city.place

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>{place} 관광지</h2>
          <div className="nav-actions">
            <button className="btn ghost" type="button" onClick={nav.go.info}>
              목록
            </button>
            {nav.user ? (
              <button className="btn" type="button" onClick={startWrite}>
                추가
              </button>
            ) : null}
          </div>
        </div>

        <article className="info-card travel-city-intro">
          <img className="gallery-preview" src={city.src} alt="" />
          <h3>{city.title}</h3>
          <p>{city.body}</p>
        </article>

        {writing ? (
          <form className="board-form" onSubmit={(e) => void submit(e)}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="관광지 이름" required />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="설명" required />
            <textarea value={tip} onChange={(e) => setTip(e.target.value)} rows={2} placeholder="찾아가는 힌트" />
            <input type="file" accept="image/*" onChange={(e) => void onFile(e.target.files?.[0])} />
            {src ? <img className="gallery-preview" src={src} alt="" /> : null}
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
          {cards.map((spot) => {
            const maps = mapSearchLinks(place, spot.name)
            return (
              <article className="travel-card" key={spot.id}>
                <img src={spot.src} alt="" />
                <div className="travel-card-body">
                  <h3>{spot.name}</h3>
                  <p>{spot.body}</p>
                  {spot.tip ? <p className="muted">{spot.tip}</p> : null}
                  <div className="nav-actions">
                    <a className="btn ghost" href={maps.naver} target="_blank" rel="noreferrer">
                      네이버 지도
                    </a>
                    <a className="btn ghost" href={maps.google} target="_blank" rel="noreferrer">
                      구글 지도
                    </a>
                  </div>
                  {canEditTravelSpot(spot, nav.user) ? (
                    <div className="nav-actions">
                      <button className="btn ghost" type="button" onClick={() => startEdit(spot)}>
                        수정
                      </button>
                      <button className="btn ghost" type="button" onClick={() => void remove(spot.id)}>
                        삭제
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </PageShell>
  )
}
