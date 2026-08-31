import jwt from 'jsonwebtoken'
import { User } from './models.js'

const secret = () => process.env.JWT_SECRET || 'triplog-dev-secret'

export function signToken(userId) {
  return jwt.sign({ sub: userId }, secret(), { expiresIn: '30d' })
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
  return { id: String(user._id), email: user.email, name: user.name }
}
