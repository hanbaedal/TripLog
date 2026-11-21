import type { ItemKind, MealSlot, ShoppingType, Trip } from '../types'
import { dayCount } from './dates'
import { itemActual, itemBudget } from './tripItem'

export const KIND_LABEL: Record<ItemKind, string> = {
  flight: '항공',
  hotel: '호텔',
  meal: '식사',
  sight: '관광',
  transport: '교통',
  shopping: '쇼핑',
}

export const MEAL_LABEL: Record<MealSlot, string> = {
  breakfast: '조식',
  lunch: '중식',
  dinner: '석식',
  latenight: '야식',
  snack: '간식',
}

export const TRANSPORT_LABEL: Record<string, string> = {
  train: '기차',
  subway: '전철',
  bus: '버스',
  tourbus: '투어버스',
  ferry: '페리',
  taxi: '택시',
  rentalcar: '렌터카',
  car: '택시',
  walk: '도보',
  other: '기타',
}

export const SHOPPING_TYPES: { slug: ShoppingType; label: string }[] = [
  { slug: 'dutyfree', label: '면세점' },
  { slug: 'mall', label: '복합쇼핑몰' },
  { slug: 'outlet', label: '아울렛' },
  { slug: 'market', label: '전통시장' },
  { slug: 'nightmarket', label: '야시장' },
  { slug: 'supermarket', label: '대형마트' },
  { slug: 'street', label: '쇼핑거리' },
]

export const SHOPPING_LABEL: Record<ShoppingType, string> = {
  dutyfree: '면세점',
  mall: '복합쇼핑몰',
  outlet: '아울렛',
  market: '전통시장',
  nightmarket: '야시장',
  supermarket: '대형마트',
  street: '쇼핑거리',
}

export function krw(n: number): string {
  return `${new Intl.NumberFormat('ko-KR').format(Math.round(n))}원`
}

export function formatVariance(delta: number): string {
  if (!delta) return '±0'
  const sign = delta > 0 ? '+' : '−'
  return `${sign}${krw(Math.abs(delta)).replace('원', '')}`
}

export function summarize(trip: Trip) {
  const people = Math.max(1, trip.adults + trip.children)
  const days = dayCount(trip.startDate, trip.endDate)
  const nights = Math.max(0, days - 1)
  const byKindBudget: Record<ItemKind, number> = {
    flight: 0,
    hotel: 0,
    meal: 0,
    sight: 0,
    transport: 0,
    shopping: 0,
  }
  const byKindActual: Record<ItemKind, number> = {
    flight: 0,
    hotel: 0,
    meal: 0,
    sight: 0,
    transport: 0,
    shopping: 0,
  }
  /** 집행 금액이 입력된 항목의 예산만 모아, 차이 계산이 공정하도록 한다. */
  const byKindComparedBudget: Record<ItemKind, number> = {
    flight: 0,
    hotel: 0,
    meal: 0,
    sight: 0,
    transport: 0,
    shopping: 0,
  }
  const byMeal: Record<MealSlot, number> = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    latenight: 0,
    snack: 0,
  }
  const byDay = Array.from({ length: days }, () => 0)
  let actualItemCount = 0
  let comparedBudgetTotal = 0

  for (const item of trip.items) {
    const kind = item.kind in byKindBudget ? item.kind : undefined
    if (!kind) continue
    const budget = itemBudget(item)
    byKindBudget[kind] += budget
    const actual = itemActual(item)
    if (actual != null) {
      byKindActual[kind] += actual
      byKindComparedBudget[kind] += budget
      comparedBudgetTotal += budget
      actualItemCount += 1
    }
    if (kind === 'meal') {
      const slot = item.mealSlot && item.mealSlot in byMeal ? item.mealSlot : 'snack'
      byMeal[slot] += budget
    }
    if (item.dayIndex >= 0 && item.dayIndex < days) {
      byDay[item.dayIndex] += budget
    }
  }

  const total = Object.values(byKindBudget).reduce((sum, v) => sum + v, 0)
  const actualTotal = Object.values(byKindActual).reduce((sum, v) => sum + v, 0)
  const byKindVariance = (Object.keys(byKindBudget) as ItemKind[]).reduce(
    (acc, kind) => {
      // 집행 미입력 분류는 차이를 0으로 두고, 화면에서 — 로 표시한다.
      acc[kind] =
        byKindActual[kind] > 0 || byKindComparedBudget[kind] > 0
          ? byKindActual[kind] - byKindComparedBudget[kind]
          : 0
      return acc
    },
    {} as Record<ItemKind, number>,
  )

  return {
    total,
    actualTotal,
    actualItemCount,
    comparedBudgetTotal,
    variance: actualItemCount ? actualTotal - comparedBudgetTotal : 0,
    people,
    perPerson: Math.round(total / people),
    actualPerPerson: actualItemCount ? Math.round(actualTotal / people) : 0,
    perDay: days ? Math.round(total / days) : 0,
    byKind: byKindBudget,
    byKindBudget,
    byKindActual,
    byKindComparedBudget,
    byKindVariance,
    byMeal,
    byDay,
    days,
    nights,
  }
}
