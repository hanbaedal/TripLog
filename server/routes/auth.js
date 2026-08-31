import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models.js'
import { applySupervisorRole, optionalUser, publicUser, requireUser, signToken, supervisorRole } from '../auth.js'
import { isValidPhone, normalizePhone } from '../lib/phone.js'

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
  const user = await User.create({ name, email, phone, passwordHash, role: supervisorRole(name, email) })
  res.status(201).json({ token: signToken(user.id), user: publicUser(user) })
})

authRouter.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
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

authRouter.patch('/me', requireUser, async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || '')
  if (!currentPassword || !(await bcrypt.compare(currentPassword, req.user.passwordHash))) {
    res.status(401).json({ error: '현재 비밀번호가 맞지 않습니다.' })
    return
  }
  const email = String(req.body?.email || req.user.email || '').trim().toLowerCase()
  const phone = normalizePhone(req.body?.phone ?? req.user.phone ?? '')
  const password = String(req.body?.password || '')
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
