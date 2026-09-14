import { useEffect, useMemo, useState } from 'react'
import type { ItemKind, MealSlot, SightType, TransportMode, Trip, TripItem, User, GalleryPhoto } from '../types'
import { SIGHT_TYPES } from '../data/galleryTaxonomy.js'
import { PageShell } from './PageShell'
import { FlightSearch } from './FlightSearch'
import { HotelSearch } from './HotelSearch'
import { ItemModal } from './ItemModal'
import { attachFlight, attachHotel } from '../lib/connect/attach'
import { KIND_LABEL, MEAL_LABEL, TRANSPORT_LABEL, krw, summarize } from '../lib/costs'
import { itemActual, itemBudget } from '../lib/tripItem'
import { rescaleConnectItems } from '../lib/pax'
import { dateOn, dayCount, formatShort } from '../lib/dates'
import { hasItemPhoto, resolveItemPhoto } from '../data/sightPhotos'
import { loadGalleryPhotos } from '../lib/galleryResolve'
import type { SiteNav } from '../lib/siteNav'

type Props = {
  trip: Trip
  user: User | null
  copyingSample?: boolean
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  onChange: (trip: Trip) => void
  onSave?: () => void
  onSaveCopy?: () => void
  nav: SiteNav
  guideHint?: string
  onViewGuide?: () => void
  onPublish?: () => void
  onUnpublish?: () => void
}

type ItemPreset = {
  kind: ItemKind
  mealSlot?: MealSlot
  sightType?: SightType | ''
  transportMode?: TransportMode
}

const MAIN_CHIPS: { label: string; action: 'flight' | 'hotel' | 'meal' | 'sight' | 'transport' }[] = [
  { label: '+ 항공', action: 'flight' },
  { label: '+ 호텔', action: 'hotel' },
  { label: '+ 식비', action: 'meal' },
  { label: '+ 관광', action: 'sight' },
  { label: '+ 교통', action: 'transport' },
]

const MEAL_CHIPS: { label: string; mealSlot: MealSlot }[] = [
  { label: '조식', mealSlot: 'breakfast' },
  { label: '중식', mealSlot: 'lunch' },
  { label: '석식', mealSlot: 'dinner' },
  { label: '야식', mealSlot: 'latenight' },
  { label: '간식', mealSlot: 'snack' },
]

const TRANSPORT_CHIPS: { label: string; mode: TransportMode }[] = [
  { label: '기차', mode: 'train' },
  { label: '전철', mode: 'subway' },
  { label: '버스', mode: 'bus' },
  { label: '투어버스', mode: 'tourbus' },
  { label: '페리', mode: 'ferry' },
  { label: '택시', mode: 'taxi' },
  { label: '도보', mode: 'walk' },
  { label: '기타', mode: 'other' },
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
  if (item.kind === 'sight' && item.sightType) {
    const row = SIGHT_TYPES.find((entry) => entry.slug === item.sightType)
    label = row ? `${KIND_LABEL.sight} · ${row.label}` : KIND_LABEL.sight
  }
  if (item.kind === 'transport' && item.transportMode) {
    label = `${KIND_LABEL.transport} · ${TRANSPORT_LABEL[item.transportMode]}`
  }
  return item.source === 'connect' ? `연동 · ${label}` : label
}

function costLine(item: TripItem): string {
  const budget = itemBudget(item)
  const actual = itemActual(item)
  if (actual != null) return `${budget ? krw(budget) : '—'} → ${krw(actual)}`
  return budget ? krw(budget) : '—'
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
  saveStatus = 'idle',
  onChange,
  onSave,
  onSaveCopy,
  nav,
  guideHint = '',
  onViewGuide,
  onPublish,
  onUnpublish,
}: Props) {
  const days = dayCount(trip.startDate, trip.endDate)
  const [day, setDay] = useState(0)
  const [editing, setEditing] = useState<TripItem | null>(null)
  const [preset, setPreset] = useState<ItemPreset | null>(null)
  const [chipMenu, setChipMenu] = useState<null | 'meal' | 'sight' | 'transport'>(null)
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

  const maxBar = Math.max(
    1,
    ...Object.values(summary.byKindBudget),
    ...Object.values(summary.byKindActual),
  )

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

  function setPax(nextAdults: number, nextChildren: number) {
    if (locked) return
    const adults = Math.max(1, Math.min(99, nextAdults))
    const children = Math.max(0, Math.min(99, nextChildren))
    if (adults === trip.adults && children === trip.children) return
    const items = rescaleConnectItems(trip.items, trip.adults, trip.children, adults, children)
    onChange({ ...trip, adults, children, items })
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
    <PageShell {...nav}>
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
            <div className="trip-pax">
              <label className="field field-pax">
                <span>성인</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={trip.adults}
                  onChange={(e) => setPax(Number(e.target.value) || 1, trip.children)}
                  disabled={locked}
                />
              </label>
              <label className="field field-pax">
                <span>소아</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={trip.children}
                  onChange={(e) => setPax(trip.adults, Number(e.target.value) || 0)}
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
            ) : onSave ? (
              <button
                className="btn stamp"
                type="button"
                onClick={onSave}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving'
                  ? '저장 중…'
                  : saveStatus === 'saved'
                    ? '저장됨'
                    : '저장'}
              </button>
            ) : null}
            {saveStatus === 'error' ? (
              <span className="planner-save-hint">여행 이름·일정을 입력한 뒤 다시 저장해 주세요.</span>
            ) : null}
            {guideHint ? <span className="planner-save-hint">{guideHint}</span> : null}
            {!copyingSample && onPublish && onUnpublish ? (
              <button
                className="btn ghost"
                type="button"
                onClick={trip.publishedSampleId ? onUnpublish : onPublish}
              >
                {trip.publishedSampleId ? '공개 취소' : '추천 일정에 공개'}
              </button>
            ) : null}
            {onViewGuide ? (
              <button className="btn forest" type="button" onClick={onViewGuide}>
                안내서 보기
              </button>
            ) : null}
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
              {chipMenu ? (
                <>
                  <button className="chip chip-back" type="button" onClick={() => setChipMenu(null)}>
                    ← 돌아가기
                  </button>
                  {chipMenu === 'meal'
                    ? MEAL_CHIPS.map((chip) => (
                        <button
                          key={chip.mealSlot}
                          className="chip"
                          type="button"
                          onClick={() => {
                            setEditing(null)
                            setPreset({ kind: 'meal', mealSlot: chip.mealSlot })
                            setChipMenu(null)
                          }}
                        >
                          {chip.label}
                        </button>
                      ))
                    : null}
                  {chipMenu === 'sight'
                    ? SIGHT_TYPES.map((row) => (
                        <button
                          key={row.slug}
                          className="chip"
                          type="button"
                          onClick={() => {
                            setEditing(null)
                            setPreset({ kind: 'sight', sightType: row.slug as SightType })
                            setChipMenu(null)
                          }}
                        >
                          {row.label}
                        </button>
                      ))
                    : null}
                  {chipMenu === 'transport'
                    ? TRANSPORT_CHIPS.map((chip) => (
                        <button
                          key={chip.mode}
                          className="chip"
                          type="button"
                          onClick={() => {
                            setEditing(null)
                            setPreset({ kind: 'transport', transportMode: chip.mode })
                            setChipMenu(null)
                          }}
                        >
                          {chip.label}
                        </button>
                      ))
                    : null}
                </>
              ) : (
                MAIN_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    className={`chip ${chip.action === 'flight' || chip.action === 'hotel' ? 'connect' : ''}`}
                    type="button"
                    onClick={() => {
                      setEditing(null)
                      if (chip.action === 'flight') {
                        setSearch('flight')
                        return
                      }
                      if (chip.action === 'hotel') {
                        setSearch('hotel')
                        return
                      }
                      setChipMenu(chip.action)
                    }}
                  >
                    {chip.label}
                  </button>
                ))
              )}
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
                    <div className="cost-n cost-line">{costLine(item)}</div>
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
                      <div className="cost-n">{costLine(item)}</div>
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
                      <div className="cost-n">{costLine(item)}</div>
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
            {summary.actualItemCount ? (
              <p className="muted">
                집행 {krw(summary.actualTotal)}
                {summary.variance ? (
                  <span className={summary.variance > 0 ? 'variance-over' : 'variance-under'}>
                    {' '}
                    ({summary.variance > 0 ? '+' : ''}
                    {krw(Math.abs(summary.variance)).replace('원', '')})
                  </span>
                ) : null}
              </p>
            ) : null}
            <p className="muted">
              성인 {trip.adults}
              {trip.children ? ` · 소아 ${trip.children}` : ''} · 1인당 {krw(summary.perPerson)}
            </p>
            <p className="muted">하루 평균 {krw(summary.perDay)}</p>
            <div className="kicker" style={{ marginTop: 10 }}>
              예산 vs 집행
            </div>
            <div className="budget-compare-head">
              <span>분류</span>
              <span>예산</span>
              <span>집행</span>
              <span>차이</span>
            </div>
            {(['flight', 'hotel', 'meal', 'sight', 'transport'] as const).map((kind) => {
              const budget = summary.byKindBudget[kind]
              const actual = summary.byKindActual[kind]
              const delta = summary.byKindVariance[kind]
              return (
                <div className="budget-compare-row" key={kind}>
                  <span>{KIND_LABEL[kind]}</span>
                  <span>{budget ? krw(budget) : '—'}</span>
                  <span>{actual ? krw(actual) : '—'}</span>
                  <span className={delta > 0 ? 'variance-over' : delta < 0 ? 'variance-under' : ''}>
                    {actual ? (delta > 0 ? '+' : delta < 0 ? '−' : '') : ''}
                    {actual ? krw(Math.abs(delta)).replace('원', '') : '—'}
                  </span>
                </div>
              )
            })}
            <div style={{ height: 10 }} />
            {(['flight', 'hotel', 'meal', 'sight', 'transport'] as const).map((kind) => (
              <div className="bar" key={kind}>
                <span>{KIND_LABEL[kind]}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill bar-fill-budget"
                    style={{
                      width: `${(summary.byKindBudget[kind] / maxBar) * 100}%`,
                      background: KIND_COLOR[kind],
                    }}
                  />
                  {summary.byKindActual[kind] ? (
                    <div
                      className="bar-fill bar-fill-actual"
                      style={{
                        width: `${(summary.byKindActual[kind] / maxBar) * 100}%`,
                        background: KIND_COLOR[kind],
                        opacity: 0.45,
                      }}
                    />
                  ) : null}
                </div>
                <span>{krw(summary.byKindBudget[kind])}</span>
              </div>
            ))}
            <div style={{ height: 10 }} />
            <div className="kicker">Meals</div>
            {(['breakfast', 'lunch', 'dinner', 'latenight', 'snack'] as const).map((slot) => (
              <div className="bar" key={slot}>
                <span>{MEAL_LABEL[slot]}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(summary.byMeal[slot] / Math.max(1, summary.byKindBudget.meal)) * 100}%`,
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
          {onViewGuide ? (
            <section>
              <button className="btn" type="button" onClick={onViewGuide} style={{ width: '100%' }}>
                안내서 보기
              </button>
            </section>
          ) : null}
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
            setChipMenu(null)
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
    </PageShell>
  )
}
