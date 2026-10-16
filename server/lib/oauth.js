import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { User } from '../models.js'
import { applySupervisorRole, signToken, supervisorRole } from '../auth.js'

const secret = () => process.env.JWT_SECRET || 'triplog-dev-secret'

export function appBaseUrl(req) {
  const configured = String(process.env.APP_URL || process.env.OAUTH_CALLBACK_BASE || '').trim()
  if (configured) return configured.replace(/\/$/, '')
  const host = req.get('x-forwarded-host') || req.get('host')
  const proto = req.get('x-forwarded-proto') || req.protocol || 'http'
  return `${proto}://${host}`
}

export function oauthRedirectUri(req, provider) {
  return `${appBaseUrl(req)}/api/auth/${provider}/callback`
}

export function signOAuthState(provider) {
  return jwt.sign({ provider, n: crypto.randomBytes(16).toString('hex') }, secret(), { expiresIn: '10m' })
}

export function verifyOAuthState(state, provider) {
  const payload = jwt.verify(String(state || ''), secret())
  if (payload.provider !== provider) throw new Error('invalid_state')
  return payload
}

/** Comma-separated Kakao consent scopes, e.g. profile_nickname,account_email — only if enabled in Kakao Developers. */
export function kakaoOAuthScopeParam() {
  const raw = String(process.env.KAKAO_OAUTH_SCOPE ?? '').trim()
  return raw
}

export function oauthConfigured(provider) {
  if (provider === 'kakao') return Boolean(process.env.KAKAO_REST_API_KEY)
  if (provider === 'google') {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  }
  return false
}

function oauthPlaceholderEmail(provider, providerId) {
  return `${provider}_${providerId}@oauth.triplog.local`
}

export async function upsertOAuthUser({ provider, providerId, email, name }) {
  let user = await User.findOne({ authProvider: provider, providerId: String(providerId) })
  if (user) {
    await applySupervisorRole(user)
    return user
  }

  const normalizedEmail = email?.trim().toLowerCase() || oauthPlaceholderEmail(provider, providerId)
  const displayName = String(name || '').trim() || '회원'

  user = await User.findOne({ email: normalizedEmail })
  if (user) {
    if (user.authProvider === 'email') {
      if (!user.providerId) {
        user.providerId = String(providerId)
        await user.save()
        await applySupervisorRole(user)
        return user
      }
      throw new Error('email_account_exists')
    }
    if (user.authProvider === provider && user.providerId === String(providerId)) {
      await applySupervisorRole(user)
      return user
    }
    throw new Error('email_taken')
  }

  user = await User.create({
    email: normalizedEmail,
    name: displayName,
    phone: '',
    passwordHash: '',
    authProvider: provider,
    providerId: String(providerId),
    role: supervisorRole(displayName, normalizedEmail),
  })
  await applySupervisorRole(user)
  return user
}

export async function exchangeKakaoCode(req, code) {
  const clientId = process.env.KAKAO_REST_API_KEY
  const redirectUri = oauthRedirectUri(req, 'kakao')
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code: String(code),
  })
  if (process.env.KAKAO_CLIENT_SECRET) {
    body.set('client_secret', process.env.KAKAO_CLIENT_SECRET)
  }

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body,
  })
  const tokenData = await tokenRes.json()
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error('kakao_token_failed')
  }

  const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const profile = await profileRes.json()
  if (!profileRes.ok || !profile.id) {
    throw new Error('kakao_profile_failed')
  }

  return {
    provider: 'kakao',
    providerId: String(profile.id),
    email: profile.kakao_account?.email || '',
    name: profile.kakao_account?.profile?.nickname || profile.properties?.nickname || '',
  }
}

export async function exchangeGoogleCode(req, code) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = oauthRedirectUri(req, 'google')

  const body = new URLSearchParams({
    code: String(code),
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const tokenData = await tokenRes.json()
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error('google_token_failed')
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const profile = await profileRes.json()
  if (!profileRes.ok || !profile.sub) {
    throw new Error('google_profile_failed')
  }

  return {
    provider: 'google',
    providerId: String(profile.sub),
    email: profile.email || '',
    name: profile.name || profile.given_name || '',
  }
}

export function finishOAuthRedirect(req, res, { token, error }) {
  const base = appBaseUrl(req)
  const url = new URL('/', base)
  if (token) url.searchParams.set('token', token)
  if (error) url.searchParams.set('oauth_error', error)
  res.redirect(url.toString())
}

export async function completeOAuthLogin(req, res, profile) {
  const user = await upsertOAuthUser(profile)
  finishOAuthRedirect(req, res, { token: signToken(user.id) })
}

export function oauthErrorMessage(code) {
  const map = {
    not_configured: '소셜 로그인 설정이 아직 완료되지 않았습니다.',
    invalid_state: '로그인 요청이 만료되었습니다. 다시 시도해 주세요.',
    access_denied: '로그인이 취소되었습니다.',
    email_account_exists: '이 이메일은 이미 이메일 가입으로 등록되어 있습니다. 이메일로 로그인해 주세요.',
    email_taken: '이 이메일은 다른 계정에서 사용 중입니다.',
    kakao_token_failed: '카카오 로그인에 실패했습니다.',
    kakao_profile_failed: '카카오 프로필을 가져오지 못했습니다.',
    google_token_failed: 'Google 로그인에 실패했습니다.',
    google_profile_failed: 'Google 프로필을 가져오지 못했습니다.',
    oauth_failed: '소셜 로그인에 실패했습니다.',
  }
  return map[code] || map.oauth_failed
}
