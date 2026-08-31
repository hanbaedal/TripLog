import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ItemKind, MealSlot, TransportMode, TripItem } from '../types'
import { KIND_LABEL, MEAL_LABEL, TRANSPORT_LABEL } from '../lib/costs'

type Props = {
  dayIndex: number
  initial?: TripItem
  preset?: { kind: ItemKind; mealSlot?: MealSlot }
  onClose: () => void
  onSave: (item: TripItem) => void
  onDelete?: () => void
}

const KINDS: ItemKind[] = ['flight', 'hotel', 'meal', 'sight', 'transport']
const MEALS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'latenight']
const MODES: TransportMode[] = ['train', 'bus', 'ferry', 'car', 'walk', 'other']

function defaultTime(kind: ItemKind, mealSlot?: MealSlot): string {
  if (kind === 'meal') {
    if (mealSlot === 'breakfast') return '08:00'
    if (mealSlot === 'lunch') return '12:30'
    if (mealSlot === 'dinner') return '18:30'
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

export function ItemModal({ dayIndex, initial, preset, onClose, onSave, onDelete }: Props) {
  const [kind, setKind] = useState<ItemKind>(initial?.kind ?? preset?.kind ?? 'sight')
  const [mealSlot, setMealSlot] = useState<MealSlot>(
    initial?.mealSlot ?? preset?.mealSlot ?? 'lunch',
  )
  const [transportMode, setTransportMode] = useState<TransportMode>(
    initial?.transportMode ?? 'train',
  )
  const [time, setTime] = useState(
    initial?.time ?? defaultTime(initial?.kind ?? preset?.kind ?? 'sight', preset?.mealSlot),
  )
  const [title, setTitle] = useState(initial?.title ?? '')
  const [place, setPlace] = useState(initial?.place ?? '')
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [cost, setCost] = useState(initial ? String(initial.cost) : '')

  function changeKind(next: ItemKind) {
    setKind(next)
    if (!initial) setTime(defaultTime(next, mealSlot))
  }

  function changeMeal(next: MealSlot) {
    setMealSlot(next)
    if (!initial) setTime(defaultTime('meal', next))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const item: TripItem = {
      id: initial?.id ?? uid(),
      dayIndex: initial?.dayIndex ?? dayIndex,
      time,
      kind,
      title: trimmed,
      place: place.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      note: note.trim() || undefined,
      cost: Number(cost) || 0,
      mealSlot: kind === 'meal' ? mealSlot : undefined,
      transportMode: kind === 'transport' ? transportMode : undefined,
    }
    onSave(item)
  }

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-modal-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h2 id="item-modal-title">{initial ? '일정 수정' : '일정 추가'}</h2>
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
        {kind === 'meal' ? (
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
        {kind === 'transport' ? (
          <div className="slot-grid">
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
        ) : null}
        <div className="form-grid">
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
                kind === 'flight'
                  ? '예: KE723 인천 → 간사이'
                  : kind === 'hotel'
                    ? '예: 난바 오리엔탈 호텔'
                    : kind === 'meal'
                      ? '예: 구로몬 시장 모둠'
                      : kind === 'transport'
                        ? '예: 난카이 라피트'
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
              placeholder="항공사, 인원, 객실 타입"
            />
          </label>
          <label>
            예상 비용 (원, 일행 합계)
            <input
              type="number"
              min="0"
              step="1000"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0"
            />
          </label>
          <label>
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
  )
}
