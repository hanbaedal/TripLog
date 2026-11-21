import { Router } from 'express'
import { optionalUser, requireSupervisor } from '../auth.js'
import { Visit } from '../models.js'

export const visitsRouter = Router()

const VIEW_LABEL = {
  home: '홈',
  samples: '추천 일정',
  trips: '내 여행',
  planner: '플래너',
  guide: '안내서',
  info: '여행 정보',
  infoPlace: '여행지',
  subway: '전철타고',
  gallery: '갤러리',
  catalog: '카탈로그',
  galleryWrite: '사진 올리기',
  board: '자유게시판',
  inquiry: '문의사항',
  manual: '사용자메뉴얼',
  sitemap: '사이트맵',
  profile: '내정보',
  taxonomyCity: '도시 분류',
  taxonomyCategory: '일정 분류',
  taxonomySightType: '관광 유형',
  taxonomyFoodType: '음식 종류',
  usersAdmin: '회원 관리',
  visitStats: '방문통계',
}

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

visitsRouter.post('/', optionalUser, async (req, res) => {
  const view = String(req.body?.view || '').trim().slice(0, 64)
  if (!view) {
    res.status(400).json({ error: 'view가 필요합니다.' })
    return
  }
  const marketRaw = String(req.body?.market || '').trim()
  const market = marketRaw === 'kr' || marketRaw === 'cn' ? marketRaw : ''
  const path = String(req.body?.path || '').trim().slice(0, 200)
  await Visit.create({
    view,
    market,
    path,
    userId: req.user?._id || null,
    day: dayKey(),
  })
  res.status(201).json({ ok: true })
})

visitsRouter.get('/stats', requireSupervisor, async (req, res) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30))
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - (days - 1))
  since.setUTCHours(0, 0, 0, 0)

  const match = { createdAt: { $gte: since } }
  const [total, today, loggedIn, byDay, byView, byMarket] = await Promise.all([
    Visit.countDocuments(match),
    Visit.countDocuments({ day: dayKey() }),
    Visit.countDocuments({ ...match, userId: { $ne: null } }),
    Visit.aggregate([
      { $match: match },
      { $group: { _id: '$day', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Visit.aggregate([
      { $match: match },
      { $group: { _id: '$view', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]),
    Visit.aggregate([
      { $match: match },
      { $group: { _id: '$market', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ])

  res.json({
    days,
    total,
    today,
    loggedIn,
    guest: Math.max(0, total - loggedIn),
    byDay: byDay.map((row) => ({ day: row._id, count: row.count })),
    byView: byView.map((row) => ({
      view: row._id,
      label: VIEW_LABEL[row._id] || row._id,
      count: row.count,
    })),
    byMarket: byMarket.map((row) => ({
      market: row._id || 'unknown',
      label: row._id === 'kr' ? '국내여행' : row._id === 'cn' ? '중국여행' : '미지정',
      count: row.count,
    })),
  })
})
