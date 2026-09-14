import { Router } from 'express'
import { requireSupervisor } from '../auth.js'
import { TaxonomyOption } from '../models.js'

const KINDS = ['city', 'category', 'sightType', 'foodType']

export const taxonomyRouter = Router()

function parseMarket(raw) {
  const value = String(raw || 'cn').trim()
  return value === 'kr' ? 'kr' : 'cn'
}

function groupRows(rows) {
  const cities = []
  const categories = []
  const sightTypes = []
  const foodTypes = []
  for (const row of rows) {
    const item = {
      slug: row.slug,
      label: row.label,
      labelZh: row.labelZh || '',
      sort: row.sort ?? 99,
    }
    if (row.kind === 'city') cities.push(item)
    else if (row.kind === 'category') categories.push(item)
    else if (row.kind === 'sightType') sightTypes.push(item)
    else if (row.kind === 'foodType') foodTypes.push(item)
  }
  const bySort = (a, b) => (a.sort || 99) - (b.sort || 99) || a.label.localeCompare(b.label, 'ko')
  return {
    cities: cities.sort(bySort),
    categories: categories.sort(bySort),
    sightTypes: sightTypes.sort(bySort),
    foodTypes: foodTypes.sort(bySort),
  }
}

async function rowsForMarket(market) {
  return TaxonomyOption.find({ market, slug: { $ne: 'other' } }).sort({ kind: 1, sort: 1, label: 1 })
}

taxonomyRouter.get('/', async (req, res) => {
  const market = parseMarket(req.query.market)
  const rows = await rowsForMarket(market)
  res.json(groupRows(rows))
})

taxonomyRouter.post('/', requireSupervisor, async (req, res) => {
  const kind = String(req.body?.kind || '').trim()
  const market = parseMarket(req.body?.market)
  const slug = String(req.body?.slug || '').trim().toLowerCase()
  const label = String(req.body?.label || '').trim()
  const labelZh = String(req.body?.labelZh || '').trim()
  const sort = Number(req.body?.sort) || 99
  if (!KINDS.includes(kind) || !slug || !label) {
    res.status(400).json({ error: '종류, 코드, 이름이 필요합니다.' })
    return
  }
  if (slug === 'other') {
    res.status(400).json({ error: 'other 코드는 사용할 수 없습니다.' })
    return
  }
  const exists = await TaxonomyOption.findOne({ market, kind, slug })
  if (exists) {
    res.status(409).json({ error: '이미 있는 항목입니다.' })
    return
  }
  await TaxonomyOption.create({
    market,
    kind,
    slug,
    label,
    labelZh,
    sort,
  })
  const rows = await rowsForMarket(market)
  res.status(201).json(groupRows(rows))
})

taxonomyRouter.put('/:kind/:slug', requireSupervisor, async (req, res) => {
  const kind = String(req.params.kind || '').trim()
  const slug = String(req.params.slug || '').trim()
  const market = parseMarket(req.query.market ?? req.body?.market)
  const label = String(req.body?.label || '').trim()
  const labelZh = String(req.body?.labelZh || '').trim()
  const nextSlug = String(req.body?.slug || slug).trim().toLowerCase()
  const sort = Number(req.body?.sort) || 99
  if (nextSlug === 'other') {
    res.status(400).json({ error: 'other 코드는 사용할 수 없습니다.' })
    return
  }
  const doc = await TaxonomyOption.findOne({ market, kind, slug })
  if (!doc) {
    res.status(404).json({ error: '항목을 찾지 못했습니다.' })
    return
  }
  if (nextSlug !== slug) {
    const taken = await TaxonomyOption.findOne({ market, kind, slug: nextSlug })
    if (taken) {
      res.status(409).json({ error: '이미 있는 코드입니다.' })
      return
    }
    doc.slug = nextSlug
  }
  doc.label = label
  doc.labelZh = labelZh
  doc.sort = sort
  await doc.save()
  const rows = await rowsForMarket(market)
  res.json(groupRows(rows))
})

taxonomyRouter.delete('/:kind/:slug', requireSupervisor, async (req, res) => {
  const kind = String(req.params.kind || '').trim()
  const slug = String(req.params.slug || '').trim()
  const market = parseMarket(req.query.market)
  const result = await TaxonomyOption.deleteOne({ market, kind, slug })
  if (!result.deletedCount) {
    res.status(404).json({ error: '항목을 찾지 못했습니다.' })
    return
  }
  const rows = await rowsForMarket(market)
  res.json(groupRows(rows))
})
