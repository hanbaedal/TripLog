import type { User } from '../types'
import { uid } from './id'
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

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const trimmedName = name.trim()
  const normalized = email.trim().toLowerCase()
  if (trimmedName.length < 2) throw new Error('이름은 두 글자 이상이어야 합니다.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('이메일 형식을 확인해 주세요.')
  if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.')

  if (await useCloud()) {
    const data = await api<{ token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: trimmedName, email: normalized, password }),
    })
    setToken(data.token)
    return data.user
  }

  const users = readUsers()
  if (users.some((u) => u.email === normalized)) {
    throw new Error('이미 가입된 이메일입니다.')
  }
  const salt = uid('salt')
  const hash = await digest(`${salt}:${password}`)
  const stored: StoredUser = {
    id: uid('user'),
    email: normalized,
    name: trimmedName,
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
