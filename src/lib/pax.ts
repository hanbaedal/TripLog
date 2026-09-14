import type { TripItem } from '../types'
import { itemBudget, withItemBudget } from './tripItem'

export function tripPeople(adults: number, children: number): number {
  return Math.max(1, adults + children)
}

export function tripRooms(adults: number, children: number): number {
  return Math.max(1, Math.ceil(tripPeople(adults, children) / 2))
}

/** 항공 1인 요금 × 성인 + 소아(75%) 가중치 */
export function paxWeight(adults: number, children: number): number {
  return Math.max(1, adults + children * 0.75)
}

/** 항공·호텔 연동(source: connect) 금액만 인원 변경에 맞춰 조정한다. */
export function rescaleConnectItems(
  items: TripItem[],
  oldAdults: number,
  oldChildren: number,
  newAdults: number,
  newChildren: number,
): TripItem[] {
  const oldRooms = tripRooms(oldAdults, oldChildren)
  const newRooms = tripRooms(newAdults, newChildren)
  const oldWeight = paxWeight(oldAdults, oldChildren)
  const newWeight = paxWeight(newAdults, newChildren)

  return items.map((item) => {
    if (item.source !== 'connect') return item
    if (item.kind === 'hotel') {
      if (oldRooms === newRooms) return item
      const budget = Math.round((itemBudget(item) * newRooms) / oldRooms)
      return withItemBudget(item, budget)
    }
    if (item.kind === 'flight') {
      if (oldWeight === newWeight) return item
      const budget = Math.round((itemBudget(item) * newWeight) / oldWeight)
      return withItemBudget(item, budget)
    }
    return item
  })
}
