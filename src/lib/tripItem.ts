import type { TripItem, TransportMode } from '../types'

export function itemBudget(item: Pick<TripItem, 'budgetCost' | 'cost'>): number {
  return Number(item.budgetCost ?? item.cost) || 0
}

export function itemActual(item: Pick<TripItem, 'actualCost'>): number | null {
  if (item.actualCost == null || item.actualCost === undefined) return null
  return Number(item.actualCost) || 0
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
