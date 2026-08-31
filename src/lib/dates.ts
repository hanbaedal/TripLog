export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dayCount(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00`).getTime()
  const b = new Date(`${end}T00:00:00`).getTime()
  const n = Math.round((b - a) / 86_400_000) + 1
  return Math.max(1, n)
}

export function dateOn(start: string, index: number): string {
  return addDays(start, index)
}

export function formatLong(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${iso}T00:00:00`))
}

export function formatShort(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${iso}T00:00:00`))
}

export function formatRange(start: string, end: string): string {
  const nights = dayCount(start, end) - 1
  return `${formatShort(start)} – ${formatShort(end)} · ${nights}박 ${dayCount(start, end)}일`
}

export function dayIndexOn(start: string, date: string): number {
  return dayCount(start, date) - 1
}
