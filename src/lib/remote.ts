const TOKEN_KEY = 'triplog.token'

let remoteReady = false

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setToken(token: string): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function isRemote(): boolean {
  return remoteReady
}

export async function probeRemote(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' })
    const data = (await res.json()) as { ok?: boolean; db?: string }
    remoteReady = Boolean(res.ok && data.ok && data.db === 'up')
  } catch {
    remoteReady = false
  }
  return remoteReady
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`/api${path}`, { ...init, headers })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error || '요청에 실패했습니다.')
  return data
}
