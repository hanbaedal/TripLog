export const GALLERY_CITIES = [
  { slug: 'dalian', label: '대련' },
  { slug: 'yantai', label: '연태' },
  { slug: 'qingdao', label: '청도' },
  { slug: 'harbin', label: '하얼빈' },
  { slug: 'beijing', label: '북경' },
  { slug: 'shanghai', label: '상하이' },
  { slug: 'hongkong', label: '홍콩' },
  { slug: 'baekdusan', label: '백두산' },
  { slug: 'xian', label: '서안' },
  { slug: 'chengdu', label: '청두' },
  { slug: 'taihang', label: '태항산' },
  { slug: 'huangshan', label: '황산' },
  { slug: 'zhangjiajie', label: '장가계' },
  { slug: 'yunnan', label: '운남' },
  { slug: 'guizhou', label: '귀주' },
  { slug: 'other', label: '기타' },
]

export const GALLERY_CATEGORIES = [
  { slug: 'sight', label: '관광' },
  { slug: 'meal', label: '음식' },
  { slug: 'hotel', label: '호텔' },
  { slug: 'transport', label: '교통' },
  { slug: 'flight', label: '항공' },
  { slug: 'other', label: '기타' },
]

export const SIGHT_TYPES = [
  { slug: 'mountain', label: '산·협곡' },
  { slug: 'lake', label: '호수·강' },
  { slug: 'beach', label: '해변·해안' },
  { slug: 'palace', label: '궁궐·유적' },
  { slug: 'temple', label: '사찰·종교' },
  { slug: 'town', label: '거리·마을' },
  { slug: 'park', label: '공원·테마' },
  { slug: 'other', label: '기타' },
]

const CITY_BY_LABEL = Object.fromEntries(GALLERY_CITIES.map((row) => [row.label, row.slug]))

export function citySlugFromPlace(place) {
  const bit = String(place || '')
    .split(/[·,/]/)[0]
    .trim()
  if (!bit) return ''
  if (CITY_BY_LABEL[bit]) return CITY_BY_LABEL[bit]
  const found = GALLERY_CITIES.find((row) => row.slug === bit)
  return found?.slug || ''
}

export function guessSightType(name) {
  const n = String(name || '')
  if (/山|岭|峰|峡|谷|崖|mount|peak|canyon|cliff/i.test(n) || /산$|봉$|협곡|대협곡|계곡|절벽|봉우리/.test(n)) {
    return 'mountain'
  }
  if (/湖|池|江|河|溪|泉|호$|천지|강$|하구|수원|瀑布|폭포|瀑/.test(n)) return 'lake'
  if (/海|湾|滩|岛|港|滨|岸|해변|해안|항$|만$|조$|공항|스노|해수|항구|부두|해변/.test(n)) return 'beach'
  if (
    /宫|城|墙|楼|塔|殿|陵|墓|坊|里|古城|遗址|故|gate|fort|wall/i.test(n) ||
    /궁|성$|성벽|병마|유적|고성|탑$|문$|릉$|기념탑|광장$|왕$|天安|금성|자금|만리|이화|병마용|성곽/.test(n)
  ) {
    return 'palace'
  }
  if (/寺|庙|观|祠|堂|教|church|cathedral|mosque|shrine/i.test(n) || /사$|사원|묘$|종$|성당|교회|탑$/.test(n)) {
    return 'temple'
  }
  if (/公园|乐园|园$|基地|博物|美术|gallery|798|街|巷|里|村|镇|古城|市场|시장|거리|마을|구$|조계|외탄|후퉁|박물|미술|테마|동물|판다/.test(n)) {
    return 'park'
  }
  if (/walk|산책|광장|해변공원|거리|번화|쇼핑|야시|night/i.test(n)) return 'town'
  return 'town'
}

export function galleryCategoryLabel(slug) {
  return GALLERY_CATEGORIES.find((row) => row.slug === slug)?.label || slug || ''
}

export function galleryCityLabel(slug) {
  return GALLERY_CITIES.find((row) => row.slug === slug)?.label || slug || ''
}

export function sightTypeLabel(slug) {
  return SIGHT_TYPES.find((row) => row.slug === slug)?.label || slug || ''
}

export function normalizeGalleryCategory(value) {
  const slug = String(value || '').trim()
  return GALLERY_CATEGORIES.some((row) => row.slug === slug) ? slug : 'other'
}

export function normalizeCity(value) {
  const slug = String(value || '').trim()
  if (GALLERY_CITIES.some((row) => row.slug === slug)) return slug
  return citySlugFromPlace(slug) || 'other'
}

export function normalizeSightType(value, category) {
  if (normalizeGalleryCategory(category) !== 'sight') return ''
  const slug = String(value || '').trim()
  return SIGHT_TYPES.some((row) => row.slug === slug) ? slug : 'other'
}
