export function normalizePhone(value: string): string {
  return String(value || '').replace(/\D/g, '')
}

export function isValidPhone(value: string): boolean {
  return /^01[016789]\d{7,8}$/.test(normalizePhone(value))
}

export function formatPhone(value: string): string {
  const digits = normalizePhone(value)
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return value.trim()
}
