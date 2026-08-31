export function uid(prefix = 'id'): string {
  return `${prefix}-${crypto.randomUUID()}`
}
