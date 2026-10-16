import type { AuthProvider, User } from '../types'
import { isValidPhone, normalizePhone } from './phone'
import { api, apiUrl, getToken, setToken } from './remote'

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

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  not_configured: '소셜 로그인 설정이 아직 완료되지 않았습니다.',
  invalid_state: '로그인 요청이 만료되었습니다. 다시 시도해 주세요.',
  access_denied: '로그인이 취소되었습니다.',
  email_account_exists: '이 이메일은 이미 이메일 가입으로 등록되어 있습니다. 이메일로 로그인해 주세요.',
  email_taken: '이 이메일은 다른 계정에서 사용 중입니다.',
  kakao_token_failed: '카카오 로그인에 실패했습니다.',
  kakao_client_auth:
    '카카오 REST API 키 또는 Client Secret이 맞지 않습니다. 카카오 콘솔「Client Secret」과 Render KAKAO_CLIENT_SECRET을 확인해 주세요.',
  kakao_redirect_mismatch:
    '카카오 Redirect URI가 맞지 않습니다. triplog.my 콜백 URL과 Render KAKAO_REDIRECT_URI를 확인해 주세요.',
  kakao_code_invalid: '카카오 로그인 시간이 지났습니다. 다시 시도해 주세요.',
  kakao_profile_failed: '카카오 프로필을 가져오지 못했습니다.',
  google_token_failed: 'Google 로그인에 실패했습니다.',
  google_profile_failed: 'Google 프로필을 가져오지 못했습니다.',
  oauth_failed: '소셜 로그인에 실패했습니다.',
}

export function oauthErrorMessage(code: string): string {
  return OAUTH_ERROR_MESSAGES[code] || OAUTH_ERROR_MESSAGES.oauth_failed
}

export type OAuthSetupInfo = {
  appUrl: string
  kakao: string
  google: string
  kakaoRestApiKey: string | null
  kakaoConsoleSteps: string[]
  googleConsoleSteps: string[]
  registerNote: string
}

export async function fetchOAuthSetup(): Promise<OAuthSetupInfo> {
  return api<OAuthSetupInfo>('/auth/oauth-setup')
}

export async function fetchAuthProviders(): Promise<Record<AuthProvider, boolean>> {
  const data = await api<{ kakao: boolean; google: boolean }>('/auth/providers')
  return { email: true, kakao: data.kakao, google: data.google }
}

export function startOAuth(provider: Exclude<AuthProvider, 'email'>): void {
  window.location.href = apiUrl(`/api/auth/${provider}`)
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
