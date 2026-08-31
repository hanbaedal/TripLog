import type { ItemKind, MealSlot, Trip } from '../types'
import { dayCount } from './dates'

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
}

export const TRANSPORT_LABEL: Record<string, string> = {
  train: '기차',
  bus: '버스',
  ferry: '페리',
  car: '차량',
  walk: '도보',
  other: '기타',
}

export function krw(n: number): string {
  return `${new Intl.NumberFormat('ko-KR').format(Math.round(n))}원`
}

export function summarize(trip: Trip) {
  const people = Math.max(1, trip.adults + trip.children)
  const days = dayCount(trip.startDate, trip.endDate)
  const byKind: Record<ItemKind, number> = {
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
  }
  const byDay = Array.from({ length: days }, () => 0)

  for (const item of trip.items) {
    byKind[item.kind] += item.cost
    if (item.kind === 'meal' && item.mealSlot) {
      byMeal[item.mealSlot] += item.cost
    }
    if (item.dayIndex >= 0 && item.dayIndex < days) {
      byDay[item.dayIndex] += item.cost
    }
  }

  const total = Object.values(byKind).reduce((sum, v) => sum + v, 0)
  return {
    total,
    people,
    perPerson: Math.round(total / people),
    perDay: days ? Math.round(total / days) : 0,
    byKind,
    byMeal,
    byDay,
    days,
  }
}
