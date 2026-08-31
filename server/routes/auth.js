import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models.js'
import { applySupervisorRole, publicUser, requireUser, signToken, supervisorRole } from '../auth.js'

export const authRouter = Router()

authRouter.post('/signup', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (name.length < 2) {
    res.status(400).json({ error: '이름은 두 글자 이상이어야 합니다.' })
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: '이메일 형식을 확인해 주세요.' })
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
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash, role: supervisorRole(name, email) })
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

authRouter.get('/me', requireUser, async (req, res) => {
  await applySupervisorRole(req.user)
  res.json({ user: publicUser(req.user) })
})
