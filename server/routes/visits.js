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
  return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
}

function dayKeyDaysAgo(days) {
  return dayKey(new Date(Date.now() - days * 86_400_000))
}

function fillDayRange(days) {
  const out = []
  for (let i = days - 1; i >= 0; i -= 1) out.push(dayKeyDaysAgo(i))
  return out
}

function sanitizeVisitorId(raw) {
  const id = String(raw || '').trim().slice(0, 64)
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id) ? id : ''
}

async function sumDailyGuestUv(sinceDayInclusive) {
  const rows = await Visit.aggregate([
    {
      $match: {
        day: { $gte: sinceDayInclusive },
        userId: null,
        visitorId: { $nin: [null, ''] },
      },
    },
    { $group: { _id: { day: '$day', visitorId: '$visitorId' } } },
    { $group: { _id: '$_id.day', uv: { $sum: 1 } } },
    { $group: { _id: null, n: { $sum: '$uv' } } },
  ])
  return rows[0]?.n || 0
}

async function dailyGuestUvMap(sinceDayInclusive) {
  const rows = await Visit.aggregate([
    {
      $match: {
        day: { $gte: sinceDayInclusive },
        userId: null,
        visitorId: { $nin: [null, ''] },
      },
    },
    { $group: { _id: { day: '$day', visitorId: '$visitorId' } } },
    { $group: { _id: '$_id.day', uv: { $sum: 1 } } },
  ])
  return new Map(rows.map((row) => [row._id, row.uv]))
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
  const visitorId = sanitizeVisitorId(req.body?.visitorId)
  await Visit.create({
    view,
    market,
    path,
    visitorId,
    userId: req.user?._id || null,
    day: dayKey(),
  })
  res.status(201).json({ ok: true })
})

visitsRouter.get('/stats', requireSupervisor, async (req, res) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30))
  const today = dayKey()
  const sinceDay = dayKeyDaysAgo(days - 1)
  const match = { day: { $gte: sinceDay } }

  const [
    total,
    todayPv,
    loggedIn,
    byDayRaw,
    byView,
    byMarket,
    byPath,
    todayUvRow,
    uv7d,
    uv30d,
    allTimePv,
    allTimeUv,
    loggedInAll,
  ] = await Promise.all([
    Visit.countDocuments(match),
    Visit.countDocuments({ day: today }),
    Visit.countDocuments({ ...match, userId: { $ne: null } }),
    Visit.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$day',
          count: { $sum: 1 },
          loggedIn: { $sum: { $cond: [{ $ne: ['$userId', null] }, 1, 0] } },
          guest: { $sum: { $cond: [{ $eq: ['$userId', null] }, 1, 0] } },
        },
      },
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
    Visit.aggregate([
      { $match: { ...match, path: { $nin: [null, ''] } } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]),
    Visit.aggregate([
      {
        $match: {
          day: today,
          userId: null,
          visitorId: { $nin: [null, ''] },
        },
      },
      { $group: { _id: '$visitorId' } },
      { $count: 'n' },
    ]),
    sumDailyGuestUv(dayKeyDaysAgo(6)),
    sumDailyGuestUv(dayKeyDaysAgo(29)),
    Visit.countDocuments({}),
    sumDailyGuestUv('1970-01-01'),
    Visit.countDocuments({ userId: { $ne: null } }),
  ])

  const uvByDay = await dailyGuestUvMap(sinceDay)
  const byDayMap = new Map(
    byDayRaw.map((row) => [
      row._id,
      {
        day: row._id,
        count: row.count,
        guest: row.guest,
        loggedIn: row.loggedIn,
        uv: uvByDay.get(row._id) || 0,
      },
    ]),
  )
  const byDay = fillDayRange(days).map((day) => {
    const row = byDayMap.get(day)
    return row || { day, count: 0, guest: 0, loggedIn: 0, uv: 0 }
  })

  res.json({
    days,
    total,
    today: todayPv,
    loggedIn,
    guest: Math.max(0, total - loggedIn),
    todayUv: todayUvRow[0]?.n || 0,
    uv7d,
    uv30d,
    allTimePv,
    allTimeUv,
    loggedInAll,
    byDay,
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
    byPath: byPath.map((row) => ({
      path: row._id || '/',
      count: row.count,
    })),
  })
})
