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
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Gyeongbok-gung_palace.jpg/960px-Gyeongbok-gung_palace.jpg',
  'kr-seoul':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Gyeongbok-gung_palace.jpg/960px-Gyeongbok-gung_palace.jpg',
  'kr-gangwon':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Footbridge_at_Seoraksan_National_Park.jpg/960px-Footbridge_at_Seoraksan_National_Park.jpg',
  'kr-chungcheong':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/View_of_Gongju_02.jpg/960px-View_of_Gongju_02.jpg',
  'kr-gyeonggi':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Suwon_Hwaseong.jpg/960px-Suwon_Hwaseong.jpg',
  'kr-gyeongsang':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Korea-Gyeongju-Bulguksa-04.jpg/960px-Korea-Gyeongju-Bulguksa-04.jpg',
  'kr-jeolla':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Jeonju_Hanok_Maeul_02.jpg/960px-Jeonju_Hanok_Maeul_02.jpg',
  'kr-jeju':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Seongsan_Ilchulbong.jpg/960px-Seongsan_Ilchulbong.jpg',
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
