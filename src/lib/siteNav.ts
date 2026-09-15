import type { Market, User } from '../types'

export type AppView =
  | 'home'
  | 'samples'
  | 'trips'
  | 'planner'
  | 'guide'
  | 'info'
  | 'infoPlace'
  | 'gallery'
  | 'catalog'
  | 'galleryWrite'
  | 'board'
  | 'inquiry'
  | 'sitemap'
  | 'profile'
  | 'taxonomyCity'
  | 'taxonomyCategory'
  | 'taxonomySightType'
  | 'taxonomyFoodType'
  | 'usersAdmin'

export type SiteGo = {
  home: () => void
  samples: () => void
  trips: () => void
  info: () => void
  infoPlace: (cityId: string) => void
  gallery: (photoId?: string, returnTo?: 'home') => void
  catalog: (photoId?: string) => void
  galleryWrite: (photoId?: string) => void
  board: () => void
  inquiry: () => void
  sitemap: () => void
  profile: () => void
  taxonomyCity: () => void
  taxonomyCategory: () => void
  taxonomySightType: () => void
  taxonomyFoodType: () => void
  usersAdmin: () => void
  auth: () => void
  logout: () => void
}

export type SiteNav = {
  view: AppView
  user: User | null
  market: Market
  setMarket: (market: Market) => void
  go: SiteGo
}

export const SITE_LINKS: { id: AppView; label: string }[] = [
  { id: 'samples', label: '추천 일정' },
  { id: 'trips', label: '내 여행' },
  { id: 'info', label: '여행 정보' },
  { id: 'gallery', label: '갤러리' },
  { id: 'board', label: '자유게시판' },
  { id: 'inquiry', label: '문의사항' },
  { id: 'sitemap', label: '사이트맵' },
]

/** 슈퍼바이저 탐색기 — 분류 관리 4종 */
export const TAXONOMY_ADMIN_LINKS: { id: AppView; label: string }[] = [
  { id: 'taxonomyCity', label: '도시 분류' },
  { id: 'taxonomyCategory', label: '일정 분류' },
  { id: 'taxonomySightType', label: '관광 유형' },
  { id: 'taxonomyFoodType', label: '음식 종류' },
]

export const SUPERVISOR_LINKS: { id: AppView; label: string }[] = [
  { id: 'catalog', label: '카탈로그' },
  ...TAXONOMY_ADMIN_LINKS,
  { id: 'usersAdmin', label: '회원 관리' },
]

export type TaxonomyAdminView = (typeof TAXONOMY_ADMIN_LINKS)[number]['id']

export function taxonomyViewToKind(view: TaxonomyAdminView): 'city' | 'category' | 'sightType' | 'foodType' {
  if (view === 'taxonomyCity') return 'city'
  if (view === 'taxonomyCategory') return 'category'
  if (view === 'taxonomySightType') return 'sightType'
  return 'foodType'
}

export function isTaxonomyAdminView(view: AppView): view is TaxonomyAdminView {
  return TAXONOMY_ADMIN_LINKS.some((link) => link.id === view)
}

export function visibleSiteLinks(user: User | null) {
  return SITE_LINKS.filter((link) => link.id !== 'trips' || Boolean(user))
}

export function goSite(nav: SiteNav, id: AppView) {
  if (id === 'home') nav.go.home()
  else if (id === 'samples') nav.go.samples()
  else if (id === 'trips') nav.go.trips()
  else if (id === 'info') nav.go.info()
  else if (id === 'infoPlace') nav.go.info()
  else if (id === 'gallery') nav.go.gallery()
  else if (id === 'catalog') nav.go.catalog()
  else if (id === 'board') nav.go.board()
  else if (id === 'inquiry') nav.go.inquiry()
  else if (id === 'sitemap') nav.go.sitemap()
  else if (id === 'profile') nav.go.profile()
  else if (id === 'taxonomyCity') nav.go.taxonomyCity()
  else if (id === 'taxonomyCategory') nav.go.taxonomyCategory()
  else if (id === 'taxonomySightType') nav.go.taxonomySightType()
  else if (id === 'taxonomyFoodType') nav.go.taxonomyFoodType()
  else if (id === 'usersAdmin') nav.go.usersAdmin()
}
