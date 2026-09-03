import { useEffect, useMemo, useState } from 'react'
import type { ItemKind, MealSlot, Trip, TripItem, User, GalleryPhoto } from '../types'
import { AppNav } from './AppNav'
import { FlightSearch } from './FlightSearch'
import { HotelSearch } from './HotelSearch'
import { ItemModal } from './ItemModal'
import { attachFlight, attachHotel } from '../lib/connect/attach'
import { KIND_LABEL, MEAL_LABEL, TRANSPORT_LABEL, krw, summarize } from '../lib/costs'
import { dateOn, dayCount, formatShort } from '../lib/dates'
import { hasItemPhoto, resolveItemPhoto } from '../data/sightPhotos'
import { loadGalleryPhotos } from '../lib/galleryResolve'
import type { SiteNav } from '../lib/siteNav'

type Props = {
  trip: Trip
  user: User | null
  copyingSample?: boolean
  onChange: (trip: Trip) => void
  onSaveCopy?: () => void
  nav: SiteNav
  onGuide: () => void
  onPublish?: () => void
  onUnpublish?: () => void
}

const ADD_CHIPS: { label: string; kind: ItemKind; mealSlot?: MealSlot }[] = [
  { label: '+ 항공', kind: 'flight' },
  { label: '+ 호텔', kind: 'hotel' },
  { label: '+ 조식', kind: 'meal', mealSlot: 'breakfast' },
  { label: '+ 중식', kind: 'meal', mealSlot: 'lunch' },
  { label: '+ 석식', kind: 'meal', mealSlot: 'dinner' },
  { label: '+ 야식', kind: 'meal', mealSlot: 'latenight' },
  { label: '+ 관광', kind: 'sight' },
  { label: '+ 교통', kind: 'transport' },
]

const KIND_COLOR: Record<ItemKind, string> = {
  flight: 'var(--sky)',
  hotel: 'var(--forest)',
  meal: 'var(--meal)',
  sight: 'var(--gold)',
  transport: 'var(--ink)',
}

function badgeText(item: TripItem): string {
  let label = KIND_LABEL[item.kind]
  if (item.kind === 'meal' && item.mealSlot) label = MEAL_LABEL[item.mealSlot]
  if (item.kind === 'transport' && item.transportMode) {
    label = `${KIND_LABEL.transport} · ${TRANSPORT_LABEL[item.transportMode]}`
  }
  return item.source === 'connect' ? `연동 · ${label}` : label
}

function SightThumb({ src, label, onOpen }: { src: string; label: string; onOpen: () => void }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <button
      type="button"
      className="item-photo"
      aria-label={`${label} 사진 크게 보기`}
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
    >
      <img src={src} alt="" onError={() => setOk(false)} />
    </button>
  )
}

function tripDestinationFromTitle(title: string, fallback: string): string {
  const bit = String(title || '')
    .trim()
    .split(/\s+/)[0]
  return bit || fallback
}

export function Planner({
  trip,
  user,
  copyingSample,
  onChange,
  onSaveCopy,
  nav,
  onGuide,
  onPublish,
  onUnpublish,
}: Props) {
  const days = dayCount(trip.startDate, trip.endDate)
  const [day, setDay] = useState(0)
  const [editing, setEditing] = useState<TripItem | null>(null)
  const [preset, setPreset] = useState<{ kind: ItemKind; mealSlot?: MealSlot } | null>(null)
  const [search, setSearch] = useState<null | 'flight' | 'hotel'>(null)
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([])
  const open = editing !== null || preset !== null
  const locked = !user

  useEffect(() => {
    void loadGalleryPhotos().then(setGalleryPhotos)
  }, [])

  const summary = useMemo(() => summarize(trip), [trip])
  const selected = Math.min(day, Math.max(0, days - 1))
  const dayItems = useMemo(
    () =>
      trip.items
        .filter((item) => item.dayIndex === selected)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [trip.items, selected],
  )

  const maxBar = Math.max(1, ...Object.values(summary.byKind))

  function patch(partial: Partial<Trip>) {
    if (locked) return
    const next = { ...trip, ...partial }
    if (next.endDate < next.startDate) next.endDate = next.startDate
    const n = dayCount(next.startDate, next.endDate)
    next.items = next.items.map((item) => ({
      ...item,
      dayIndex: Math.min(item.dayIndex, n - 1),
    }))
    onChange(next)
  }

  function openItem(item: TripItem) {
    if (locked) return
    setPreset(null)
    setEditing(item)
  }

  function saveItem(item: TripItem) {
    if (locked) return
    const exists = trip.items.some((it) => it.id === item.id)
    onChange({
      ...trip,
      items: exists
        ? trip.items.map((it) => (it.id === item.id ? item : it))
        : [...trip.items, item],
    })
    setEditing(null)
    setPreset(null)
  }

  function deleteItem(id: string) {
    if (locked) return
    onChange({ ...trip, items: trip.items.filter((it) => it.id !== id) })
    setEditing(null)
    setPreset(null)
  }

  return (
    <div>
      <AppNav {...nav} />
    <div className={`planner-shell${locked ? ' is-locked' : ''}`}>
      <div className="planner-head-sticky">
      <header className="planner-bar">
        <div className="planner-bar-inner">
          <div className="trip-compact">
            <label className="field trip-name">
              <span>여행 이름</span>
              <input
                value={trip.title}
                onChange={(e) => {
                  const title = e.target.value
                  patch({ title, destination: tripDestinationFromTitle(title, trip.destination) })
                }}
                placeholder="예: 大连市 3박4일"
                disabled={locked}
              />
            </label>
            <div className="trip-dates">
              <label className="field field-date">
                <span>시작</span>
                <input
                  type="date"
                  value={trip.startDate}
                  onChange={(e) => patch({ startDate: e.target.value })}
                  disabled={locked}
                />
              </label>
              <span className="trip-date-sep" aria-hidden="true">
                –
              </span>
              <label className="field field-date">
                <span>종료</span>
                <input
                  type="date"
                  value={trip.endDate}
                  onChange={(e) => patch({ endDate: e.target.value })}
                  disabled={locked}
                />
              </label>
            </div>
          </div>
          {user ? (
          <div className="planner-actions">
            {copyingSample && onSaveCopy ? (
              <button className="btn stamp" type="button" onClick={onSaveCopy}>
                내 여행에 저장
              </button>
            ) : null}
            {!copyingSample && onPublish && onUnpublish ? (
              <button
                className="btn ghost"
                type="button"
                onClick={trip.publishedSampleId ? onUnpublish : onPublish}
              >
                {trip.publishedSampleId ? '공개 취소' : '추천 일정에 공개'}
              </button>
            ) : null}
            <button className="btn forest" type="button" onClick={onGuide}>
              안내서 만들기
            </button>
          </div>
          ) : null}
        </div>
      </header>

      <nav className="day-rail" aria-label="날짜">
        {Array.from({ length: days }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`day-btn ${i === selected ? 'active' : ''}`}
            onClick={() => setDay(i)}
          >
            {i + 1}일차
            <small>{formatShort(dateOn(trip.startDate, i))}</small>
          </button>
        ))}
      </nav>
      </div>

      <div className="planner-grid">
        <section className="timeline">
          {!locked ? (
            <div className="chips">
              {ADD_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  className={`chip ${chip.kind === 'flight' || chip.kind === 'hotel' ? 'connect' : ''}`}
                  type="button"
                  onClick={() => {
                    setEditing(null)
                    if (chip.kind === 'flight') {
                      setSearch('flight')
                      return
                    }
                    if (chip.kind === 'hotel') {
                      setSearch('hotel')
                      return
                    }
                    setPreset({ kind: chip.kind, mealSlot: chip.mealSlot })
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          ) : null}
          {dayItems.length === 0 ? null : (
            dayItems.map((item) => {
              const pictured = hasItemPhoto(item.kind)
              const photo = pictured ? resolveItemPhoto(item, trip.destination, galleryPhotos) : undefined
              const copy = (
                <>
                  <span className={`badge ${item.kind}`}>{badgeText(item)}</span>
                  <h3>{item.title}</h3>
                  <div className="meta">
                    {[item.place, item.subtitle, item.note].filter(Boolean).join(' · ')}
                  </div>
                  {pictured ? (
                    <div className="cost-n cost-line">{item.cost ? krw(item.cost) : '—'}</div>
                  ) : null}
                </>
              )
              const body = locked ? (
                <div className={pictured ? 'card-copy' : 'card-main'}>
                  {pictured ? (
                    copy
                  ) : (
                    <>
                      <div>{copy}</div>
                      <div className="cost-n">{item.cost ? krw(item.cost) : '—'}</div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className={pictured ? 'card-copy' : 'card-main'}
                  onClick={() => openItem(item)}
                >
                  {pictured ? (
                    copy
                  ) : (
                    <>
                      <div>{copy}</div>
                      <div className="cost-n">{item.cost ? krw(item.cost) : '—'}</div>
                    </>
                  )}
                </button>
              )
              return (
                <div key={item.id} className="item-row">
                  <div className="item-time">{item.time}</div>
                  <div className="rail">
                    <div className={`dot ${item.kind}`} />
                  </div>
                  <article className={`card${pictured ? ' card-photo' : ''}`}>
                    {body}
                    {pictured && photo ? (
                      <SightThumb
                        src={photo}
                        label={item.title}
                        onOpen={() => setLightbox({ src: photo, title: item.title })}
                      />
                    ) : null}
                  </article>
                </div>
              )
            })
          )}
        </section>

        <aside className="side-col">
          <section>
            <div className="kicker">Budget</div>
            <div className="cost-total">{krw(summary.total)}</div>
            <p className="muted">하루 평균 {krw(summary.perDay)}</p>
            {(['flight', 'hotel', 'meal', 'sight', 'transport'] as const).map((kind) => (
              <div className="bar" key={kind}>
                <span>{KIND_LABEL[kind]}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(summary.byKind[kind] / maxBar) * 100}%`,
                      background: KIND_COLOR[kind],
                    }}
                  />
                </div>
                <span>{krw(summary.byKind[kind])}</span>
              </div>
            ))}
            <div style={{ height: 10 }} />
            <div className="kicker">Meals</div>
            {(['breakfast', 'lunch', 'dinner', 'latenight'] as const).map((slot) => (
              <div className="bar" key={slot}>
                <span>{MEAL_LABEL[slot]}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(summary.byMeal[slot] / Math.max(1, summary.byKind.meal)) * 100}%`,
                      background: 'var(--meal)',
                    }}
                  />
                </div>
                <span>{krw(summary.byMeal[slot])}</span>
              </div>
            ))}
          </section>
          <section>
            <div className="kicker">Today’s path</div>
            <h3 style={{ fontFamily: 'var(--serif)', margin: '6px 0 12px' }}>이날 동선</h3>
            {dayItems.length === 0 ? null : (
              <div className="route-list">
                {dayItems.map((item) => (
                  <div className="route-item" key={item.id}>
                    <i style={{ background: KIND_COLOR[item.kind] }} />
                    <div>
                      <b>{item.title}</b>
                      <div className="muted">
                        {item.time}
                        {item.place ? ` · ${item.place}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section>
            <button className="btn" type="button" onClick={onGuide} style={{ width: '100%' }}>
              안내서 미리보기
            </button>
          </section>
        </aside>
      </div>

      {open && !locked ? (
        <ItemModal
          dayIndex={selected}
          initial={editing ?? undefined}
          preset={editing ? undefined : preset ?? undefined}
          user={user}
          tripDestination={trip.destination}
          onClose={() => {
            setEditing(null)
            setPreset(null)
          }}
          onSave={saveItem}
          onDelete={editing ? () => deleteItem(editing.id) : undefined}
        />
      ) : null}
      {search === 'flight' && !locked ? (
        <FlightSearch
          trip={trip}
          focusDate={dateOn(trip.startDate, selected)}
          onClose={() => setSearch(null)}
          onManual={() => {
            setSearch(null)
            setPreset({ kind: 'flight' })
          }}
          onPick={(offer) => {
            onChange(attachFlight(trip, offer))
            setSearch(null)
          }}
        />
      ) : null}
      {search === 'hotel' && !locked ? (
        <HotelSearch
          trip={trip}
          onClose={() => setSearch(null)}
          onManual={() => {
            setSearch(null)
            setPreset({ kind: 'hotel' })
          }}
          onPick={(offer, checkIn, checkOut) => {
            onChange(attachHotel(trip, offer, checkIn, checkOut))
            setSearch(null)
          }}
        />
      ) : null}
      {lightbox ? (
        <div
          className="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox.src} alt={lightbox.title} onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </div>
    </div>
  )
}
