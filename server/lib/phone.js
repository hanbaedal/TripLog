export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '')
}

export function isValidPhone(value) {
  return /^01[016789]\d{7,8}$/.test(normalizePhone(value))
}
