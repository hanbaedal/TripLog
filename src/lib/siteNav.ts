import type { User } from '../types'

export type AppView =
  | 'home'
  | 'samples'
  | 'trips'
  | 'planner'
  | 'guide'
  | 'info'
  | 'infoPlace'
  | 'gallery'
  | 'galleryWrite'
  | 'board'
  | 'inquiry'
  | 'sitemap'
  | 'profile'
  | 'taxonomyAdmin'
  | 'usersAdmin'

export type SiteGo = {
  home: () => void
  samples: () => void
  trips: () => void
  info: () => void
  infoPlace: (cityId: string) => void
  gallery: (photoId?: string) => void
  galleryWrite: (photoId?: string) => void
  board: () => void
  inquiry: () => void
  sitemap: () => void
  profile: () => void
  taxonomyAdmin: () => void
  usersAdmin: () => void
  auth: () => void
  logout: () => void
}

export type SiteNav = {
  view: AppView
  user: User | null
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

export const SUPERVISOR_LINKS: { id: AppView; label: string }[] = [
  { id: 'taxonomyAdmin', label: '분류 관리' },
  { id: 'usersAdmin', label: '회원 관리' },
]

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
  else if (id === 'board') nav.go.board()
  else if (id === 'inquiry') nav.go.inquiry()
  else if (id === 'sitemap') nav.go.sitemap()
  else if (id === 'profile') nav.go.profile()
  else if (id === 'taxonomyAdmin') nav.go.taxonomyAdmin()
  else if (id === 'usersAdmin') nav.go.usersAdmin()
}
