import jwt from 'jsonwebtoken'
import { User } from './models.js'

const secret = () => process.env.JWT_SECRET || 'triplog-dev-secret'

export function signToken(userId) {
  return jwt.sign({ sub: userId }, secret(), { expiresIn: '30d' })
}

export async function optionalUser(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    next()
    return
  }
  try {
    const payload = jwt.verify(token, secret())
    const user = await User.findById(payload.sub)
    if (user) req.user = user
  } catch {
    /* guest */
  }
  next()
}

export async function requireUser(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: '로그인이 필요합니다.' })
    return
  }
  try {
    const payload = jwt.verify(token, secret())
    const user = await User.findById(payload.sub)
    if (!user) {
      res.status(401).json({ error: '로그인이 필요합니다.' })
      return
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: '로그인이 만료되었습니다.' })
  }
}

export function publicUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    phone: user.phone || '',
    role: user.role || 'user',
  }
}

export function supervisorRole(name = '', email = '') {
  const names = String(process.env.SUPERVISOR_NAMES || '해수')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const emails = String(process.env.SUPERVISOR_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (names.includes(String(name).trim()) || emails.includes(String(email).trim().toLowerCase())) {
    return 'supervisor'
  }
  return 'user'
}

export async function applySupervisorRole(user) {
  const role = supervisorRole(user.name, user.email)
  if (user.role !== role) {
    user.role = role
    await user.save()
  }
  return user
}

export function isSupervisorUser(user) {
  if (!user) return false
  return user.role === 'supervisor' || supervisorRole(user.name, user.email) === 'supervisor'
}

export function requireSupervisor(req, res, next) {
  requireUser(req, res, () => {
    const role = req.user.role || supervisorRole(req.user.name, req.user.email)
    if (role !== 'supervisor') {
      res.status(403).json({ error: '권한이 없습니다.' })
      return
    }
    next()
  })
}
