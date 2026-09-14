import type { ItemKind, MealSlot, Trip } from '../types'
import { dayCount } from './dates'
import { itemActual, itemBudget } from './tripItem'

export const KIND_LABEL: Record<ItemKind, string> = {
  flight: '항공',
  hotel: '호텔',
  meal: '식사',
  sight: '관광',
  transport: '교통',
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
  car: '택시',
  walk: '도보',
  other: '기타',
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
  const byKindBudget: Record<ItemKind, number> = {
    flight: 0,
    hotel: 0,
    meal: 0,
    sight: 0,
    transport: 0,
  }
  const byKindActual: Record<ItemKind, number> = {
    flight: 0,
    hotel: 0,
    meal: 0,
    sight: 0,
    transport: 0,
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

  for (const item of trip.items) {
    const budget = itemBudget(item)
    byKindBudget[item.kind] += budget
    const actual = itemActual(item)
    if (actual != null) {
      byKindActual[item.kind] += actual
      actualItemCount += 1
    }
    if (item.kind === 'meal' && item.mealSlot) {
      byMeal[item.mealSlot] += budget
    }
    if (item.dayIndex >= 0 && item.dayIndex < days) {
      byDay[item.dayIndex] += budget
    }
  }

  const total = Object.values(byKindBudget).reduce((sum, v) => sum + v, 0)
  const actualTotal = Object.values(byKindActual).reduce((sum, v) => sum + v, 0)
  const byKindVariance = (Object.keys(byKindBudget) as ItemKind[]).reduce(
    (acc, kind) => {
      acc[kind] = byKindActual[kind] - byKindBudget[kind]
      return acc
    },
    {} as Record<ItemKind, number>,
  )

  return {
    total,
    actualTotal,
    actualItemCount,
    variance: actualTotal - total,
    people,
    perPerson: Math.round(total / people),
    actualPerPerson: actualItemCount ? Math.round(actualTotal / people) : 0,
    perDay: days ? Math.round(total / days) : 0,
    byKind: byKindBudget,
    byKindBudget,
    byKindActual,
    byKindVariance,
    byMeal,
    byDay,
    days,
  }
}
