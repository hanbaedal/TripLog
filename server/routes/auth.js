import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models.js'
import { applySupervisorRole, optionalUser, publicUser, requireUser, signToken, supervisorRole } from '../auth.js'
import { isValidPhone, normalizePhone } from '../lib/phone.js'
import {
  completeOAuthLogin,
  exchangeGoogleCode,
  exchangeKakaoCode,
  finishOAuthRedirect,
  kakaoOAuthScopeParam,
  oauthConfigured,
  oauthErrorMessage,
  oauthRedirectHints,
  oauthRedirectUri,
  signOAuthState,
  verifyOAuthState,
} from '../lib/oauth.js'

export const authRouter = Router()

function emailOk(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

authRouter.get('/email-available', optionalUser, async (req, res) => {
  const email = String(req.query?.email || '').trim().toLowerCase()
  if (!emailOk(email)) {
    res.status(400).json({ error: '이메일 형식을 확인해 주세요.', available: false })
    return
  }
  const found = await User.findOne({ email })
  const available = !found || (req.user && String(found._id) === String(req.user._id))
  res.json({ available })
})

authRouter.post('/signup', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const phone = normalizePhone(req.body?.phone || '')
  if (name.length < 2) {
    res.status(400).json({ error: '이름은 두 글자 이상이어야 합니다.' })
    return
  }
  if (!emailOk(email)) {
    res.status(400).json({ error: '이메일 형식을 확인해 주세요.' })
    return
  }
  if (!isValidPhone(phone)) {
    res.status(400).json({ error: '전화번호 형식을 확인해 주세요.' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' })
    return
  }
  const exists = await User.findOne({ email })
  if (exists) {
    res.status(409).json({ error: '이미 가입된 이메일입니다.' })
    return
  }
  const phoneTaken = await User.findOne({ phone })
  if (phoneTaken) {
    res.status(409).json({ error: '이미 등록된 전화번호입니다.' })
    return
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    authProvider: 'email',
    role: supervisorRole(name, email),
  })
  res.status(201).json({ token: signToken(user.id), user: publicUser(user) })
})

authRouter.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const user = await User.findOne({ email })
  if (!user) {
    res.status(401).json({ error: '이메일 또는 비밀번호가 맞지 않습니다.' })
    return
  }
  if (user.authProvider !== 'email' || !user.passwordHash) {
    const label = user.authProvider === 'kakao' ? '카카오' : user.authProvider === 'google' ? 'Google' : '소셜'
    res.status(401).json({ error: `${label}로 가입한 계정입니다. 해당 방법으로 로그인해 주세요.` })
    return
  }
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: '이메일 또는 비밀번호가 맞지 않습니다.' })
    return
  }
  await applySupervisorRole(user)
  res.json({ token: signToken(user.id), user: publicUser(user) })
})

authRouter.post('/find-id', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const phone = normalizePhone(req.body?.phone || '')
  if (!name || !isValidPhone(phone)) {
    res.status(400).json({ error: '이름과 전화번호를 확인해 주세요.' })
    return
  }
  const user = await User.findOne({ name, phone })
  if (!user) {
    res.status(404).json({ error: '일치하는 회원을 찾지 못했습니다.' })
    return
  }
  res.json({ email: user.email })
})

authRouter.post('/reset-password', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const phone = normalizePhone(req.body?.phone || '')
  const password = String(req.body?.password || '')
  if (!emailOk(email) || !isValidPhone(phone)) {
    res.status(400).json({ error: '이메일과 전화번호를 확인해 주세요.' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' })
    return
  }
  const user = await User.findOne({ email, phone })
  if (!user) {
    res.status(404).json({ error: '일치하는 회원을 찾지 못했습니다.' })
    return
  }
  user.passwordHash = await bcrypt.hash(password, 10)
  await user.save()
  await applySupervisorRole(user)
  res.json({ token: signToken(user.id), user: publicUser(user) })
})

authRouter.get('/me', requireUser, async (req, res) => {
  await applySupervisorRole(req.user)
  res.json({ user: publicUser(req.user) })
})

authRouter.get('/providers', (_req, res) => {
  res.json({
    kakao: oauthConfigured('kakao'),
    google: oauthConfigured('google'),
  })
})

authRouter.get('/oauth-redirects', (req, res) => {
  res.json(oauthRedirectHints(req))
})

authRouter.get('/oauth-setup', (req, res) => {
  const hints = oauthRedirectHints(req)
  const kakaoKey = String(process.env.KAKAO_REST_API_KEY || '').trim()
  res.json({
    ...hints,
    kakaoRestApiKey: kakaoKey || null,
    kakaoClientSecretConfigured: Boolean(String(process.env.KAKAO_CLIENT_SECRET || '').trim()),
    kakaoConsoleSteps: [
      'developers.kakao.com → 앱(해수의 여행일지) 선택',
      '제품 설정 → 카카오 로그인 → 상태 ON',
      '앱 → 플랫폼 → Web → 사이트 도메인 https://triplog.my',
      '앱 → 플랫폼 키 → REST API 키(아래 client_id와 동일) → Redirect URI에 kakao URL 등록',
    ],
    googleConsoleSteps: [
      'Google Cloud Console → 사용자 인증 정보 → OAuth 클라이언트',
      'Authorized redirect URIs에 google URL 등록',
      'Authorized JavaScript origins에 https://triplog.my',
    ],
  })
})

authRouter.get('/kakao', (req, res) => {
  if (!oauthConfigured('kakao')) {
    finishOAuthRedirect(req, res, { error: 'not_configured' })
    return
  }
  const state = signOAuthState('kakao')
  const params = new URLSearchParams({
    client_id: process.env.KAKAO_REST_API_KEY,
    redirect_uri: oauthRedirectUri(req, 'kakao'),
    response_type: 'code',
    state,
  })
  const scope = kakaoOAuthScopeParam()
  if (scope) params.set('scope', scope)
  res.redirect(`https://kauth.kakao.com/oauth/authorize?${params}`)
})

authRouter.get('/kakao/callback', async (req, res) => {
  try {
    if (req.query.error) {
      finishOAuthRedirect(req, res, { error: String(req.query.error) })
      return
    }
    verifyOAuthState(req.query.state, 'kakao')
    const profile = await exchangeKakaoCode(req, req.query.code)
    await completeOAuthLogin(req, res, profile)
  } catch (err) {
    const code = err instanceof Error ? err.message : 'oauth_failed'
    const detail = err instanceof Error && err.cause ? String(err.cause) : ''
    if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
      finishOAuthRedirect(req, res, { error: 'oauth_failed', detail: 'account_duplicate' })
      return
    }
    finishOAuthRedirect(req, res, { error: code, detail })
  }
})

authRouter.get('/google', (req, res) => {
  if (!oauthConfigured('google')) {
    finishOAuthRedirect(req, res, { error: 'not_configured' })
    return
  }
  const state = signOAuthState('google')
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: oauthRedirectUri(req, 'google'),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

authRouter.get('/google/callback', async (req, res) => {
  try {
    if (req.query.error) {
      finishOAuthRedirect(req, res, { error: String(req.query.error) })
      return
    }
    verifyOAuthState(req.query.state, 'google')
    const profile = await exchangeGoogleCode(req, req.query.code)
    await completeOAuthLogin(req, res, profile)
  } catch (err) {
    const code = err instanceof Error ? err.message : 'oauth_failed'
    finishOAuthRedirect(req, res, { error: code })
  }
})

authRouter.patch('/me', requireUser, async (req, res) => {
  const hasPassword = Boolean(req.user.passwordHash)
  const currentPassword = String(req.body?.currentPassword || '')
  const password = String(req.body?.password || '')
  if (hasPassword) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, req.user.passwordHash))) {
      res.status(401).json({ error: '현재 비밀번호가 맞지 않습니다.' })
      return
    }
  } else if (password && password.length < 6) {
    res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' })
    return
  }
  const email = String(req.body?.email || req.user.email || '').trim().toLowerCase()
  const phone = normalizePhone(req.body?.phone ?? req.user.phone ?? '')
  if (!emailOk(email)) {
    res.status(400).json({ error: '이메일 형식을 확인해 주세요.' })
    return
  }
  if (!isValidPhone(phone)) {
    res.status(400).json({ error: '전화번호 형식을 확인해 주세요.' })
    return
  }
  const emailTaken = await User.findOne({ email, _id: { $ne: req.user._id } })
  if (emailTaken) {
    res.status(409).json({ error: '이미 가입된 이메일입니다.' })
    return
  }
  const phoneTaken = await User.findOne({ phone, _id: { $ne: req.user._id } })
  if (phoneTaken) {
    res.status(409).json({ error: '이미 등록된 전화번호입니다.' })
    return
  }
  req.user.email = email
  req.user.phone = phone
  if (password) {
    if (password.length < 6) {
      res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' })
      return
    }
    req.user.passwordHash = await bcrypt.hash(password, 10)
  }
  await req.user.save()
  await applySupervisorRole(req.user)
  res.json({ user: publicUser(req.user) })
})
