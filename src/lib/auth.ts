import type { User } from '../types'
import { uid } from './id'
import { formatPhone, isValidPhone, normalizePhone } from './phone'
import { api, getToken, isRemote, probeRemote, setToken } from './remote'

const USERS_KEY = 'triplog.users.v1'
const SESSION_KEY = 'triplog.session.v1'

type StoredUser = User & { salt: string; hash: string; role?: 'user' | 'supervisor' }

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredUser[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function publicUser(user: StoredUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ? formatPhone(user.phone) : '',
    role: user.name.trim() === '해수' ? 'supervisor' : user.role || 'user',
  }
}

export function isSupervisor(user: User | null): boolean {
  return user?.role === 'supervisor' || user?.name.trim() === '해수'
}

async function digest(value: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function useCloud(): Promise<boolean> {
  return isRemote() || (await probeRemote())
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function checkEmailAvailable(email: string, excludeId?: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase()
  if (!validEmail(normalized)) throw new Error('이메일 형식을 확인해 주세요.')
  if (await useCloud()) {
    const data = await api<{ available: boolean }>(`/auth/email-available?email=${encodeURIComponent(normalized)}`)
    return data.available
  }
  return !readUsers().some((u) => u.email === normalized && u.id !== excludeId)
}

export async function signUp(name: string, email: string, password: string, phone: string): Promise<User> {
  const trimmedName = name.trim()
  const normalized = email.trim().toLowerCase()
  const phoneDigits = normalizePhone(phone)
  if (trimmedName.length < 2) throw new Error('이름은 두 글자 이상이어야 합니다.')
  if (!validEmail(normalized)) throw new Error('이메일 형식을 확인해 주세요.')
  if (!isValidPhone(phoneDigits)) throw new Error('전화번호 형식을 확인해 주세요.')
  if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.')

  if (await useCloud()) {
    const data = await api<{ token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: trimmedName, email: normalized, password, phone: phoneDigits }),
    })
    setToken(data.token)
    return data.user
  }

  const users = readUsers()
  if (users.some((u) => u.email === normalized)) throw new Error('이미 가입된 이메일입니다.')
  if (users.some((u) => normalizePhone(u.phone || '') === phoneDigits)) {
    throw new Error('이미 등록된 전화번호입니다.')
  }
  const salt = uid('salt')
  const hash = await digest(`${salt}:${password}`)
  const stored: StoredUser = {
    id: uid('user'),
    email: normalized,
    name: trimmedName,
    phone: phoneDigits,
    role: trimmedName === '해수' ? 'supervisor' : 'user',
    salt,
    hash,
  }
  writeUsers([...users, stored])
  localStorage.setItem(SESSION_KEY, stored.id)
  return publicUser(stored)
}

export async function signIn(email: string, password: string): Promise<User> {
  const normalized = email.trim().toLowerCase()
  if (await useCloud()) {
    const data = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalized, password }),
    })
    setToken(data.token)
    return data.user
  }

  const users = readUsers()
  const found = users.find((u) => u.email === normalized)
  if (!found) throw new Error('이메일 또는 비밀번호가 맞지 않습니다.')
  const hash = await digest(`${found.salt}:${password}`)
  if (hash !== found.hash) throw new Error('이메일 또는 비밀번호가 맞지 않습니다.')
  localStorage.setItem(SESSION_KEY, found.id)
  return publicUser(found)
}

export async function findEmail(name: string, phone: string): Promise<string> {
  const trimmed = name.trim()
  const phoneDigits = normalizePhone(phone)
  if (!trimmed || !isValidPhone(phoneDigits)) throw new Error('이름과 전화번호를 확인해 주세요.')
  if (await useCloud()) {
    const data = await api<{ email: string }>('/auth/find-id', {
      method: 'POST',
      body: JSON.stringify({ name: trimmed, phone: phoneDigits }),
    })
    return data.email
  }
  const found = readUsers().find(
    (u) => u.name.trim() === trimmed && normalizePhone(u.phone || '') === phoneDigits,
  )
  if (!found) throw new Error('일치하는 회원을 찾지 못했습니다.')
  return found.email
}

export async function resetPassword(email: string, phone: string, password: string): Promise<User> {
  const normalized = email.trim().toLowerCase()
  const phoneDigits = normalizePhone(phone)
  if (!validEmail(normalized) || !isValidPhone(phoneDigits)) {
    throw new Error('이메일과 전화번호를 확인해 주세요.')
  }
  if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.')
  if (await useCloud()) {
    const data = await api<{ token: string; user: User }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: normalized, phone: phoneDigits, password }),
    })
    setToken(data.token)
    return data.user
  }
  const users = readUsers()
  const found = users.find(
    (u) => u.email === normalized && normalizePhone(u.phone || '') === phoneDigits,
  )
  if (!found) throw new Error('일치하는 회원을 찾지 못했습니다.')
  const salt = uid('salt')
  const hash = await digest(`${salt}:${password}`)
  writeUsers(users.map((u) => (u.id === found.id ? { ...u, salt, hash } : u)))
  localStorage.setItem(SESSION_KEY, found.id)
  return publicUser({ ...found, salt, hash })
}

export async function updateProfile(input: {
  email: string
  phone: string
  currentPassword: string
  password?: string
}): Promise<User> {
  const email = input.email.trim().toLowerCase()
  const phone = normalizePhone(input.phone)
  if (!validEmail(email)) throw new Error('이메일 형식을 확인해 주세요.')
  if (!isValidPhone(phone)) throw new Error('전화번호 형식을 확인해 주세요.')
  if (input.password && input.password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.')
  if (await useCloud()) {
    const data = await api<{ user: User }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({
        email,
        phone,
        currentPassword: input.currentPassword,
        password: input.password || undefined,
      }),
    })
    return data.user
  }
  const id = localStorage.getItem(SESSION_KEY)
  const users = readUsers()
  const found = users.find((u) => u.id === id)
  if (!found) throw new Error('로그인이 필요합니다.')
  const current = await digest(`${found.salt}:${input.currentPassword}`)
  if (current !== found.hash) throw new Error('현재 비밀번호가 맞지 않습니다.')
  if (users.some((u) => u.email === email && u.id !== found.id)) throw new Error('이미 가입된 이메일입니다.')
  if (users.some((u) => normalizePhone(u.phone || '') === phone && u.id !== found.id)) {
    throw new Error('이미 등록된 전화번호입니다.')
  }
  let next = { ...found, email, phone }
  if (input.password) {
    const salt = uid('salt')
    next = { ...next, salt, hash: await digest(`${salt}:${input.password}`) }
  }
  writeUsers(users.map((u) => (u.id === found.id ? next : u)))
  return publicUser(next)
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY)
  setToken('')
}

export function currentUser(): User | null {
  const id = localStorage.getItem(SESSION_KEY)
  if (!id) return null
  const found = readUsers().find((u) => u.id === id)
  return found ? publicUser(found) : null
}

export async function remoteMe(): Promise<User | null> {
  if (!getToken()) return null
  if (!(await useCloud())) return null
  try {
    const data = await api<{ user: User }>('/auth/me')
    return data.user
  } catch {
    setToken('')
    return null
  }
}
