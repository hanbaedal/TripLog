import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { PageShell } from './PageShell'
import {
  canEditTravelSpot,
  findTravelInfo,
  listTravelSpots,
  removeTravelSpot,
  saveTravelSpot,
} from '../lib/community'
import { cityGalleryId } from '../data/galleryCatalog.js'
import { SUBWAY_LINES } from '../data/krSubwayTravelCatalog.js'
import { CITY_REGION_ZH } from '../data/spotLocale.js'
import { loadGalleryPhotos, resolvePhotoSrc } from '../lib/galleryResolve'
import { formatSpotLabel, mapSearchLinks } from '../lib/mapLinks'
import type { GalleryPhoto, TravelInfo, TravelSpot } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  cityId: string
}

export function InfoPlacePage({ cityId, ...nav }: Props) {
  const [city, setCity] = useState<TravelInfo | null>(null)
  const [spots, setSpots] = useState<TravelSpot[]>([])
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [writing, setWriting] = useState(false)
  const [editing, setEditing] = useState<TravelSpot | null>(null)
  const [name, setName] = useState('')
  const [nameZh, setNameZh] = useState('')
  const [addressZh, setAddressZh] = useState('')
  const [body, setBody] = useState('')
  const [tip, setTip] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [subwayLine, setSubwayLine] = useState<string>('all')

  const isSubwayGuide = cityId === 'info-kr-subway'

  useEffect(() => {
    void findTravelInfo(cityId).then((row) => setCity(row ?? null))
    void listTravelSpots(cityId).then(setSpots)
    void loadGalleryPhotos().then(setPhotos)
  }, [cityId])

  const cards = useMemo(
    () => [...spots].sort((a, b) => (a.sort || 80) - (b.sort || 80) || a.name.localeCompare(b.name, 'ko')),
    [spots],
  )

  const subwayLineMap = useMemo(() => new Map(SUBWAY_LINES.map((row) => [row.id, row])), [])

  const filteredCards = useMemo(() => {
    if (!isSubwayGuide || subwayLine === 'all') return cards
    return cards.filter((row) => row.subwayLine === subwayLine)
  }, [cards, isSubwayGuide, subwayLine])

  const groupedSubwayCards = useMemo(() => {
    if (!isSubwayGuide || subwayLine !== 'all') return null
    const groups = new Map<string, TravelSpot[]>()
    for (const row of filteredCards) {
      const key = row.subwayLine || 'other'
      const list = groups.get(key) || []
      list.push(row)
      groups.set(key, list)
    }
    return SUBWAY_LINES.filter((line) => groups.has(line.id)).map((line) => ({
      line,
      spots: groups.get(line.id) || [],
    }))
  }, [filteredCards, isSubwayGuide, subwayLine, subwayLineMap])

  function subwayAccessLabel(spot: TravelSpot): string {
    const line = subwayLineMap.get(spot.subwayLine || '')
    const parts: string[] = []
    if (line) parts.push(line.label)
    if (spot.subwayStation) parts.push(spot.subwayStation)
    if (spot.subwayExit) parts.push(`${spot.subwayExit} 출구`)
    if (spot.walkMin) parts.push(`도보 ${spot.walkMin}분`)
    return parts.join(' · ')
  }

  function renderSpotCard(spot: TravelSpot) {
    const maps = mapSearchLinks(
      {
        cityKo: place,
        spotKo: spot.name,
        cityZh: CITY_REGION_ZH[cityId as keyof typeof CITY_REGION_ZH],
        nameZh: spot.nameZh,
        addressZh: spot.addressZh,
      },
      nav.market,
    )
    const spotPhotoId = spot.photoId || cityPhotoId
    const spotPhoto = isSubwayGuide ? resolvePhotoSrc(spotPhotoId, photos, spot.src) : ''
    const access = isSubwayGuide ? subwayAccessLabel(spot) : ''

    return (
      <article className={`travel-card${isSubwayGuide && spotPhoto ? '' : ' travel-card-text'}`} key={spot.id}>
        {isSubwayGuide && spotPhoto ? <img src={spotPhoto} alt="" /> : null}
        <div className="travel-card-body">
          <h3>{formatSpotLabel(spot, nav.market)}</h3>
          {access ? <p className="subway-access">{access}</p> : null}
          {nav.market === 'cn' && spot.addressZh ? <p className="travel-address">{spot.addressZh}</p> : null}
          <p>{spot.body}</p>
          {spot.tip ? <p className="muted">{spot.tip}</p> : null}
          <div className="travel-map-links">
            {nav.market === 'kr' ? (
              <>
                <a className="travel-map-link" href={maps.naver} target="_blank" rel="noreferrer">
                  네이버 지도
                </a>
                <a className="travel-map-link" href={maps.kakao} target="_blank" rel="noreferrer">
                  카카오맵
                </a>
              </>
            ) : (
              <a className="travel-map-link" href={maps.baidu} target="_blank" rel="noreferrer">
                百度地图
              </a>
            )}
            <a className="travel-map-link" href={maps.google} target="_blank" rel="noreferrer">
              Google Maps
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
  }

  const cityPhotoId = city?.photoId || cityGalleryId(cityId)

  function reset() {
    setWriting(false)
    setEditing(null)
    setName('')
    setNameZh('')
    setAddressZh('')
    setBody('')
    setTip('')
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
    setNameZh('')
    setAddressZh('')
    setBody('')
    setTip('')
    setError('')
  }

  function startEdit(spot: TravelSpot) {
    setWriting(true)
    setEditing(spot)
    setName(spot.name)
    setNameZh(spot.nameZh || '')
    setAddressZh(spot.addressZh || '')
    setBody(spot.body)
    setTip(spot.tip)
    setError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!nav.user) {
      nav.go.auth()
      return
    }
    if (!name.trim() || !body.trim()) {
      setError('이름과 설명이 필요합니다.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const saved = await saveTravelSpot({
        id: editing?.id,
        cityId,
        name: name.trim(),
        nameZh: nameZh.trim(),
        addressZh: addressZh.trim(),
        body: body.trim(),
        tip: tip.trim(),
        photoId: cityPhotoId,
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
  const cityPhoto = resolvePhotoSrc(cityPhotoId, photos, city.src)

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
          <img className="gallery-preview" src={cityPhoto} alt="" />
          <h3>{city.title}</h3>
          <p>{city.body}</p>
        </article>

        {writing ? (
          <form className="board-form" onSubmit={(e) => void submit(e)}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="관광지 이름 (한글)" required />
            <input value={nameZh} onChange={(e) => setNameZh(e.target.value)} placeholder="中文名称 (선택)" />
            <input
              value={addressZh}
              onChange={(e) => setAddressZh(e.target.value)}
              placeholder="中文地址 (지도 검색용, 선택)"
            />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="설명" required />
            <textarea value={tip} onChange={(e) => setTip(e.target.value)} rows={2} placeholder="찾아가는 힌트 (교통·입구 등)" />
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

        {isSubwayGuide ? (
          <div className="subway-line-filter">
            <button
              type="button"
              className={`subway-line-chip${subwayLine === 'all' ? ' active' : ''}`}
              onClick={() => setSubwayLine('all')}
            >
              전체
            </button>
            {SUBWAY_LINES.map((line) => (
              <button
                key={line.id}
                type="button"
                className={`subway-line-chip${subwayLine === line.id ? ' active' : ''}`}
                style={{ '--line-color': line.color } as CSSProperties}
                onClick={() => setSubwayLine(line.id)}
              >
                {line.label}
              </button>
            ))}
          </div>
        ) : null}

        {isSubwayGuide && groupedSubwayCards ? (
          groupedSubwayCards.map(({ line, spots: lineSpots }) => (
            <section className="subway-line-group" key={line.id}>
              <h3 className="subway-line-heading" style={{ '--line-color': line.color } as CSSProperties}>
                {line.label}
              </h3>
              <div className="travel-cards">{lineSpots.map((spot) => renderSpotCard(spot))}</div>
            </section>
          ))
        ) : (
          <div className="travel-cards">{filteredCards.map((spot) => renderSpotCard(spot))}</div>
        )}
      </section>
    </PageShell>
  )
}
