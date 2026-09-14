import type { GalleryPhoto } from '../types'
import { galleryMediaSrc } from '../lib/galleryResolve'
import { GALLERY_PHOTOS } from './galleryCatalog.js'

const BY_PLACE: Record<string, string> = {
  대련: 'dalian',
  연태: 'yantai',
  청도: 'qingdao',
  하얼빈: 'harbin',
  北京: 'beijing',
  북경: 'beijing',
  上海: 'shanghai',
  상하이: 'shanghai',
  香港: 'hongkong',
  홍콩: 'hongkong',
  长白山: 'baekdusan',
  백두산: 'baekdusan',
  西安: 'xian',
  서안: 'xian',
  시안: 'xian',
  成都: 'chengdu',
  청두: 'chengdu',
  太行山: 'taihang',
  태항산: 'taihang',
  黄山: 'huangshan',
  황산: 'huangshan',
  张家界: 'zhangjiajie',
  장가계: 'zhangjiajie',
  云南: 'yunnan',
  운남: 'yunnan',
  贵州: 'guizhou',
  귀주: 'guizhou',
  서울: 'kr-seoul',
  강원: 'kr-gangwon',
  충청: 'kr-chungcheong',
  경기: 'kr-gyeonggi',
  경상: 'kr-gyeongsang',
  전라: 'kr-jeolla',
  제주: 'kr-jeju',
}

const KR_FALLBACK: Record<string, string> = {
  'kr-seoul-day':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Gyeongbokgung%20Palace%20Korea.jpg?width=960',
  'kr-seoul':
    'https://commons.wikimedia.org/wiki/Special:FilePath/Gyeongbokgung%20Palace%20Korea.jpg?width=960',
  'kr-gangwon': 'https://commons.wikimedia.org/wiki/Special:FilePath/Seoraksan%20National%20Park%20Korea.jpg?width=960',
  'kr-chungcheong': 'https://commons.wikimedia.org/wiki/Special:FilePath/Gongju%20Gongsanseong.jpg?width=960',
  'kr-gyeonggi': 'https://commons.wikimedia.org/wiki/Special:FilePath/Suwon%20Hwaseong.jpg?width=960',
  'kr-gyeongsang': 'https://commons.wikimedia.org/wiki/Special:FilePath/Bulguksa%20Korea.jpg?width=960',
  'kr-jeolla': 'https://commons.wikimedia.org/wiki/Special:FilePath/Jeonju%20Hanok%20Village.jpg?width=960',
  'kr-jeju': 'https://commons.wikimedia.org/wiki/Special:FilePath/Seongsan%20Ilchulbong.jpg?width=960',
}

const CATALOG = GALLERY_PHOTOS as GalleryPhoto[]

export function sampleCoverPhotoId(sample: { id?: string; place?: string }): string {
  const id = (sample.id || '').trim()
  if (id && KR_FALLBACK[id]) return id
  if (id && CATALOG.some((row) => row.id === id)) return id
  const place = (sample.place || '').split(/[·,]/)[0].trim()
  if (place && BY_PLACE[place]) return BY_PLACE[place]
  return 'shanghai'
}

export function sampleCover(sample: { id?: string; place?: string }, photos?: GalleryPhoto[]): string {
  const photoId = sampleCoverPhotoId(sample)
  if (photos?.length) {
    const found = photos.find((row) => row.id === photoId)
    if (found?.src) return galleryMediaSrc(found.src)
  }
  if (KR_FALLBACK[photoId]) return KR_FALLBACK[photoId]
  const catalog = CATALOG.find((row) => row.id === photoId)
  return galleryMediaSrc(catalog?.src || CATALOG.find((row) => row.id === 'shanghai')?.src || '')
}
