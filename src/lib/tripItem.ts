import type { TripItem, TransportMode } from '../types'

/** '105,000원' · 숫자 문자열도 안전하게 합산한다. */
export function parseMoneyValue(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
  if (value == null) return 0
  const digits = String(value).replace(/[^\d.-]/g, '')
  if (!digits || digits === '-' || digits === '.') return 0
  const n = Number(digits)
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0
}

export function itemBudget(item: Pick<TripItem, 'budgetCost' | 'cost'>): number {
  if (item.budgetCost != null) return parseMoneyValue(item.budgetCost)
  if (item.cost != null) return parseMoneyValue(item.cost)
  return 0
}

export function itemActual(item: Pick<TripItem, 'actualCost'>): number | null {
  if (item.actualCost == null) return null
  return parseMoneyValue(item.actualCost)
}

export function normalizeTransportMode(mode?: string | null): TransportMode | undefined {
  if (!mode) return undefined
  if (mode === 'car') return 'taxi'
  const allowed: TransportMode[] = [
    'train',
    'subway',
    'bus',
    'tourbus',
    'ferry',
    'taxi',
    'rentalcar',
    'walk',
    'other',
  ]
  return allowed.includes(mode as TransportMode) ? (mode as TransportMode) : 'other'
}

export function normalizeTripItem(item: TripItem): TripItem {
  const budget = itemBudget(item)
  return {
    ...item,
    budgetCost: budget,
    cost: budget,
    transportMode: item.kind === 'transport' ? normalizeTransportMode(item.transportMode) : item.transportMode,
  }
}

export function withItemBudget(item: TripItem, budget: number): TripItem {
  return { ...item, budgetCost: budget, cost: budget }
}
