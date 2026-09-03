import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { publicUser, requireSupervisor, supervisorRole } from '../auth.js'
import { User } from '../models.js'

export const adminRouter = Router()

adminRouter.use(requireSupervisor)

adminRouter.get('/users', async (_req, res) => {
  const rows = await User.find().sort({ createdAt: -1 }).limit(500)
  res.json({
    users: rows.map((user) => ({
      id: String(user._id),
      email: user.email,
      name: user.name,
      phone: user.phone || '',
      role: user.role || 'user',
      createdAt: user.createdAt?.toISOString?.() ?? '',
    })),
  })
})

adminRouter.patch('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404).json({ error: '회원을 찾지 못했습니다.' })
    return
  }
  const name = String(req.body?.name ?? user.name).trim()
  const email = String(req.body?.email ?? user.email).trim().toLowerCase()
  const phone = String(req.body?.phone ?? user.phone ?? '').trim()
  const roleInput = req.body?.role
  if (name.length < 2) {
    res.status(400).json({ error: '이름은 두 글자 이상이어야 합니다.' })
    return
  }
  const emailTaken = await User.findOne({ email, _id: { $ne: user._id } })
  if (emailTaken) {
    res.status(409).json({ error: '이미 가입된 이메일입니다.' })
    return
  }
  user.name = name
  user.email = email
  user.phone = phone
  if (roleInput === 'supervisor' || roleInput === 'user') {
    user.role = roleInput
  } else {
    user.role = supervisorRole(name, email)
  }
  if (req.body?.password) {
    const password = String(req.body.password)
    if (password.length < 6) {
      res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' })
      return
    }
    user.passwordHash = await bcrypt.hash(password, 10)
  }
  await user.save()
  res.json({ user: publicUser(user) })
})

adminRouter.delete('/users/:id', async (req, res) => {
  if (String(req.user._id) === String(req.params.id)) {
    res.status(400).json({ error: '본인 계정은 삭제할 수 없습니다.' })
    return
  }
  const result = await User.deleteOne({ _id: req.params.id })
  if (!result.deletedCount) {
    res.status(404).json({ error: '회원을 찾지 못했습니다.' })
    return
  }
  res.json({ ok: true })
})
