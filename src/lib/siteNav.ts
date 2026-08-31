import type { User } from '../types'

export type AppView =
  | 'home'
  | 'samples'
  | 'trips'
  | 'planner'
  | 'guide'
  | 'info'
  | 'gallery'
  | 'galleryWrite'
  | 'board'
  | 'inquiry'
  | 'sitemap'

export type SiteGo = {
  home: () => void
  samples: () => void
  trips: () => void
  info: () => void
  gallery: (photoId?: string) => void
  galleryWrite: () => void
  board: () => void
  inquiry: () => void
  sitemap: () => void
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

export function goSite(nav: SiteNav, id: AppView) {
  if (id === 'home') nav.go.home()
  else if (id === 'samples') nav.go.samples()
  else if (id === 'trips') nav.go.trips()
  else if (id === 'info') nav.go.info()
  else if (id === 'gallery') nav.go.gallery()
  else if (id === 'board') nav.go.board()
  else if (id === 'inquiry') nav.go.inquiry()
  else if (id === 'sitemap') nav.go.sitemap()
}
