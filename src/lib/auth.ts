import type { User } from '../types'
import { isValidPhone, normalizePhone } from './phone'
import { api, getToken, setToken } from './remote'

export function isSupervisor(user: User | null): boolean {
  return user?.role === 'supervisor'
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function checkEmailAvailable(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase()
  if (!validEmail(normalized)) throw new Error('이메일 형식을 확인해 주세요.')
  const data = await api<{ available: boolean }>(`/auth/email-available?email=${encodeURIComponent(normalized)}`)
  return data.available
}

export async function signUp(name: string, email: string, password: string, phone: string): Promise<User> {
  const trimmedName = name.trim()
  const normalized = email.trim().toLowerCase()
  const phoneDigits = normalizePhone(phone)
  if (trimmedName.length < 2) throw new Error('이름은 두 글자 이상이어야 합니다.')
  if (!validEmail(normalized)) throw new Error('이메일 형식을 확인해 주세요.')
  if (!isValidPhone(phoneDigits)) throw new Error('전화번호 형식을 확인해 주세요.')
  if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.')

  const data = await api<{ token: string; user: User }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name: trimmedName, email: normalized, password, phone: phoneDigits }),
  })
  setToken(data.token)
  return data.user
}

export async function signIn(email: string, password: string): Promise<User> {
  const normalized = email.trim().toLowerCase()
  const data = await api<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: normalized, password }),
  })
  setToken(data.token)
  return data.user
}

export async function findEmail(name: string, phone: string): Promise<string> {
  const trimmed = name.trim()
  const phoneDigits = normalizePhone(phone)
  if (!trimmed || !isValidPhone(phoneDigits)) throw new Error('이름과 전화번호를 확인해 주세요.')
  const data = await api<{ email: string }>('/auth/find-id', {
    method: 'POST',
    body: JSON.stringify({ name: trimmed, phone: phoneDigits }),
  })
  return data.email
}

export async function resetPassword(email: string, phone: string, password: string): Promise<User> {
  const normalized = email.trim().toLowerCase()
  const phoneDigits = normalizePhone(phone)
  if (!validEmail(normalized) || !isValidPhone(phoneDigits)) {
    throw new Error('이메일과 전화번호를 확인해 주세요.')
  }
  if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.')
  const data = await api<{ token: string; user: User }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email: normalized, phone: phoneDigits, password }),
  })
  setToken(data.token)
  return data.user
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

export function signOut(): void {
  setToken('')
}

export async function remoteMe(): Promise<User | null> {
  if (!getToken()) return null
  try {
    const data = await api<{ user: User }>('/auth/me')
    return data.user
  } catch {
    setToken('')
    return null
  }
}
