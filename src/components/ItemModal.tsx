import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { FormEvent } from 'react'
import type { ItemKind, MealSlot, SightType, TransportMode, TripItem, User } from '../types'
import { ImagePicker } from './ImagePicker'
import { SIGHT_TYPES } from '../data/galleryTaxonomy.js'
import { citySlugFromPlace, guessSightType } from '../data/galleryTaxonomy.js'
import { itemKindToGalleryCategory } from '../lib/galleryFilter'
import type { GalleryUploadMeta } from '../lib/galleryResolve'
import { loadTaxonomy, type TaxonomyRow } from '../lib/taxonomy'
import { KIND_LABEL, MEAL_LABEL, TRANSPORT_LABEL } from '../lib/costs'
import { composeFlightItem, parseFlightForm } from '../lib/flightFields'
import { itemBudget, normalizeTransportMode, withItemBudget } from '../lib/tripItem'
import { resolveTourBusCity } from '../data/krTourBusCatalog.js'
import { TourBusPicker } from './TourBusPicker'
import type { TourBusPick } from '../lib/tourbus'

type Props = {
  dayIndex: number
  initial?: TripItem
  preset?: {
    kind: ItemKind
    mealSlot?: MealSlot
    sightType?: SightType | ''
    transportMode?: TransportMode
  }
  user?: User | null
  tripDestination?: string
  tripMarket?: 'kr' | 'cn'
  tripAdults?: number
  tripChildren?: number
  onClose: () => void
  onSave: (item: TripItem) => void
  onDelete?: () => void
}

const KINDS: ItemKind[] = ['flight', 'hotel', 'meal', 'sight', 'transport']
const MEALS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'latenight', 'snack']
const MODES: TransportMode[] = ['train', 'subway', 'bus', 'tourbus', 'ferry', 'taxi', 'walk', 'other']

function needsSubMenu(kind: ItemKind): boolean {
  return kind === 'meal' || kind === 'sight' || kind === 'transport'
}

function defaultTime(kind: ItemKind, mealSlot?: MealSlot): string {
  if (kind === 'meal') {
    if (mealSlot === 'breakfast') return '08:00'
    if (mealSlot === 'lunch') return '12:30'
    if (mealSlot === 'dinner') return '18:30'
    if (mealSlot === 'snack') return '15:00'
    return '21:30'
  }
  if (kind === 'flight') return '09:00'
  if (kind === 'hotel') return '15:00'
  if (kind === 'transport') return '09:30'
  return '10:30'
}

function uid(): string {
  return crypto.randomUUID()
}

function buildItemPayload(
  base: Omit<TripItem, 'budgetCost' | 'cost'>,
  budgetCost: number,
  actualCost: number | undefined,
  actualPeople: number | undefined,
): TripItem {
  return withItemBudget(
    {
      ...base,
      actualCost,
      actualPeople,
    },
    budgetCost,
  )
}

export function ItemModal({
  dayIndex,
  initial,
  preset,
  user,
  tripDestination,
  tripMarket,
  tripAdults = 1,
  tripChildren = 0,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const startKind = initial?.kind ?? preset?.kind ?? 'sight'
  const [kind, setKind] = useState<ItemKind>(startKind)
  const [menuLevel, setMenuLevel] = useState<'kind' | 'sub'>(() =>
    needsSubMenu(startKind) ? 'sub' : 'kind',
  )
  const [mealSlot, setMealSlot] = useState<MealSlot>(
    initial?.mealSlot ?? preset?.mealSlot ?? 'lunch',
  )
  const [sightType, setSightType] = useState<SightType | ''>(
    initial?.sightType ?? preset?.sightType ?? '',
  )
  const [transportMode, setTransportMode] = useState<TransportMode>(
    normalizeTransportMode(initial?.transportMode ?? preset?.transportMode) ?? 'train',
  )
  const [sightTypes, setSightTypes] = useState<TaxonomyRow[]>(
    SIGHT_TYPES.map((row, index) => ({
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh,
      sort: index + 1,
    })),
  )
  const [time, setTime] = useState(
    initial?.time ?? defaultTime(startKind, preset?.mealSlot),
  )
  const [title, setTitle] = useState(initial?.title ?? '')
  const [place, setPlace] = useState(initial?.place ?? '')
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [photoId, setPhotoId] = useState(initial?.photoId ?? initial?.photo ?? '')
  const [budgetCost, setBudgetCost] = useState(() =>
    initial ? String(itemBudget(initial) || '') : '',
  )
  const [actualCost, setActualCost] = useState(
    initial?.actualCost != null ? String(initial.actualCost) : '',
  )
  const [actualPeople, setActualPeople] = useState(
    initial?.actualPeople != null ? String(initial.actualPeople) : '',
  )
  const [tourBusOpen, setTourBusOpen] = useState(false)

  useEffect(() => {
    const market = tripMarket === 'kr' ? 'kr' : 'cn'
    void loadTaxonomy(market).then((bundle) => {
      if (bundle.sightTypes.length) setSightTypes(bundle.sightTypes)
    })
  }, [tripMarket])

  const uploadMeta = useMemo((): GalleryUploadMeta | undefined => {
    const category = itemKindToGalleryCategory(kind)
    if (!category) return undefined
    return {
      city: citySlugFromPlace(tripDestination) || 'dalian',
      category,
      sightType:
        category === 'sight'
          ? sightType || guessSightType(title) || 'town'
          : '',
    }
  }, [kind, tripDestination, title, sightType])

  const parsed = parseFlightForm(initial?.kind === 'flight' ? initial : undefined)
  const [departTerminal, setDepartTerminal] = useState(parsed.departTerminal)
  const [destination, setDestination] = useState(parsed.destination)
  const [arriveTime, setArriveTime] = useState(parsed.arriveTime)
  const [arriveTerminal, setArriveTerminal] = useState(parsed.arriveTerminal)
  const [flightNo, setFlightNo] = useState(parsed.flightNo)
  const [airline, setAirline] = useState(parsed.airline)

  function changeKind(next: ItemKind) {
    setKind(next)
    if (!initial) setTime(defaultTime(next, mealSlot))
    if (needsSubMenu(next)) setMenuLevel('sub')
    else setMenuLevel('kind')
  }

  function changeMeal(next: MealSlot) {
    setMealSlot(next)
    if (!initial) setTime(defaultTime('meal', next))
  }

  function parseMoney(raw: string): number {
    return Number(raw) || 0
  }

  function parseOptionalCount(raw: string): number | undefined {
    const trimmed = raw.trim()
    if (!trimmed) return undefined
    const n = Number(trimmed)
    return n > 0 ? Math.round(n) : undefined
  }

  function applyTourBusPick(pick: TourBusPick) {
    setTitle(pick.title)
    setTime(pick.time)
    setPlace(pick.place)
    setNote(pick.note)
    setTransportMode('tourbus')
    if (pick.budgetKrw) setBudgetCost(String(pick.budgetKrw))
    setTourBusOpen(false)
  }

  const tourBusCityHint =
    resolveTourBusCity(tripDestination) ||
    resolveTourBusCity(title) ||
    resolveTourBusCity(place) ||
    tripDestination ||
    ''

  function submit(e: FormEvent) {
    e.preventDefault()
    const budget = parseMoney(budgetCost)
    const actual = parseOptionalCount(actualCost)
    const people = parseOptionalCount(actualPeople)

    if (kind === 'flight') {
      const composed = composeFlightItem({
        departTime: time,
        departTerminal,
        destination,
        arriveTime,
        arriveTerminal,
        flightNo,
        airline,
      })
      if (!composed.flight.flightNo && !composed.flight.destination) return
      onSave(
        buildItemPayload(
          {
            id: initial?.id ?? uid(),
            dayIndex: initial?.dayIndex ?? dayIndex,
            time: composed.time,
            kind: 'flight',
            title: composed.title,
            place: composed.place,
            subtitle: composed.subtitle,
            note: note.trim() || undefined,
            flight: composed.flight,
            source: initial?.source,
          },
          budget,
          actual,
          people,
        ),
      )
      return
    }

    const trimmed = title.trim()
    if (!trimmed) return
    onSave(
      buildItemPayload(
        {
          id: initial?.id ?? uid(),
          dayIndex: initial?.dayIndex ?? dayIndex,
          time,
          kind,
          title: trimmed,
          place: place.trim() || undefined,
          subtitle: subtitle.trim() || undefined,
          note: note.trim() || undefined,
          mealSlot: kind === 'meal' ? mealSlot : undefined,
          sightType: kind === 'sight' && sightType ? sightType : undefined,
          transportMode: kind === 'transport' ? transportMode : undefined,
          photoId:
            kind === 'sight' || kind === 'meal' || kind === 'hotel' || kind === 'transport'
              ? photoId.trim() || undefined
              : undefined,
          source: initial?.source,
        },
        budget,
        actual,
        people,
      ),
    )
  }

  return (
    <>
      <div className="modal-back" onClick={onClose} role="presentation">
        <form
          className="modal item-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="item-modal-title"
          onClick={(e) => e.stopPropagation()}
          onSubmit={submit}
        >
        <h2 id="item-modal-title">{initial ? '일정 수정' : '일정 추가'}</h2>

        {menuLevel === 'kind' ? (
          <div className="kind-grid">
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={kind === k ? 'on' : ''}
                onClick={() => changeKind(k)}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        ) : (
          <div className="item-modal-subhead">
            <button className="btn ghost item-modal-back" type="button" onClick={() => setMenuLevel('kind')}>
              ← 항목
            </button>
            <span className="item-modal-subtitle">{KIND_LABEL[kind]}</span>
          </div>
        )}

        {menuLevel === 'sub' && kind === 'meal' ? (
          <div className="slot-grid">
            {MEALS.map((slot) => (
              <button
                key={slot}
                type="button"
                className={mealSlot === slot ? 'on' : ''}
                onClick={() => changeMeal(slot)}
              >
                {MEAL_LABEL[slot]}
              </button>
            ))}
          </div>
        ) : null}

        {menuLevel === 'sub' && kind === 'sight' ? (
          <div className="slot-grid slot-grid-wide">
            {sightTypes.map((row) => (
              <button
                key={row.slug}
                type="button"
                className={sightType === row.slug ? 'on' : ''}
                onClick={() => setSightType(row.slug as SightType)}
              >
                {row.label}
              </button>
            ))}
          </div>
        ) : null}

        {menuLevel === 'sub' && kind === 'transport' ? (
          <>
            <div className="slot-grid slot-grid-wide">
              {MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={transportMode === mode ? 'on' : ''}
                  onClick={() => setTransportMode(mode)}
                >
                  {TRANSPORT_LABEL[mode]}
                </button>
              ))}
            </div>
            {tripMarket === 'kr' && transportMode === 'tourbus' ? (
              <div className="tourbus-picker-launch">
                <button className="btn ghost" type="button" onClick={() => setTourBusOpen(true)}>
                  도시 → 코스 → 시간에서 선택
                </button>
                <p className="muted item-kr-transport-tip">
                  서울·부산·제주·경주·전주·동해 참고 일정입니다. 선택한 내용만 내 여행에 저장됩니다.
                </p>
              </div>
            ) : tripMarket === 'kr' ? (
              <p className="muted item-kr-transport-tip">
                제주: 항공+렌터카 · 권역 이동: KTX·ITX·고속버스 · 수도권: 지하철·카셰어링 · 외곽: 자차·렌터카
              </p>
            ) : null}
          </>
        ) : null}

        <div className={kind === 'flight' ? 'form-grid flight-fields' : 'form-grid'}>
          {kind === 'flight' ? (
            <>
              <label>
                출발시간
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </label>
              <label>
                출발 터미널
                <input
                  value={departTerminal}
                  onChange={(e) => setDepartTerminal(e.target.value)}
                  placeholder="T1, T2"
                />
              </label>
              <label className="span-2">
                목적지
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="北京 다싱 (PKX)"
                  required
                />
              </label>
              <label>
                도착시간
                <input type="time" value={arriveTime} onChange={(e) => setArriveTime(e.target.value)} />
              </label>
              <label>
                도착 터미널
                <input
                  value={arriveTerminal}
                  onChange={(e) => setArriveTerminal(e.target.value)}
                  placeholder="있으면 입력"
                />
              </label>
              <label>
                운항편명
                <input
                  value={flightNo}
                  onChange={(e) => setFlightNo(e.target.value)}
                  placeholder="CZ316"
                  required
                />
              </label>
              <label>
                항공사
                <input
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  placeholder="중국남방항공"
                />
              </label>
            </>
          ) : (
            <>
              <label>
                시간
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </label>
              <label>
                제목
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    kind === 'hotel'
                      ? '예: 난바 오리엔탈 호텔'
                      : kind === 'meal'
                        ? '예: 구로몬 시장 모둠'
                        : kind === 'transport'
                          ? tripMarket === 'kr'
                            ? '예: KTX 경주 · 제주 렌터카'
                            : '예: 난카이 라피트'
                          : '예: 오사카성'
                  }
                  required
                />
              </label>
              <label>
                장소 · 구간
                <input
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="주소, 역, 공항 코드"
                />
              </label>
              <label>
                보조 정보
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="객실 타입, 메뉴 등"
                />
              </label>
            </>
          )}

          <fieldset className="span-2 item-cost-fieldset">
            <legend>예산 (여행 전)</legend>
            <div className="item-cost-row">
              <label>
                비용 (원, 일행 합계)
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={budgetCost}
                  onChange={(e) => setBudgetCost(e.target.value)}
                  placeholder="0"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="span-2 item-cost-fieldset item-cost-actual">
            <legend>집행 (여행 후)</legend>
            <div className="item-cost-row">
              <label>
                실제 비용 (원)
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="미입력"
                />
              </label>
              <label>
                실제 인원 (명)
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={actualPeople}
                  onChange={(e) => setActualPeople(e.target.value)}
                  placeholder="미입력"
                />
              </label>
            </div>
          </fieldset>

          {kind === 'sight' || kind === 'meal' || kind === 'hotel' || kind === 'transport' ? (
            <div className="span-2">
              <ImagePicker
                photoId={photoId}
                onChange={setPhotoId}
                user={user ?? null}
                defaultTitle={title}
                scope="all"
                itemKind={kind}
                tripDestination={tripDestination}
                itemTitle={title}
                uploadMeta={uploadMeta}
              />
            </div>
          ) : null}
          <label className={kind === 'flight' ? 'span-2' : undefined}>
            메모
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </div>
        <div className="modal-actions">
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" type="button" onClick={onClose}>
              취소
            </button>
            {onDelete ? (
              <button className="btn ghost" type="button" onClick={onDelete}>
                삭제
              </button>
            ) : null}
          </div>
          <button className="btn" type="submit">
            저장
          </button>
        </div>
        </form>
      </div>
      {tourBusOpen
        ? createPortal(
            <TourBusPicker
              initialCity={tourBusCityHint}
              tripAdults={tripAdults}
              tripChildren={tripChildren}
              onClose={() => setTourBusOpen(false)}
              onPick={applyTourBusPick}
            />,
            document.body,
          )
        : null}
    </>
  )
}
