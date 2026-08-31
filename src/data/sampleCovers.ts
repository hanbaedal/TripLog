import type { GalleryPhoto } from '../types'
import { GALLERY_PHOTOS } from './galleryCatalog.js'

const BY_PLACE: Record<string, string> = {
  대련: 'dalian',
  연태: 'yantai',
  청도: 'qingdao',
  하얼빈: 'harbin',
  북경: 'beijing',
  상하이: 'shanghai',
  홍콩: 'hongkong',
  백두산: 'baekdusan',
  서안: 'xian',
  시안: 'xian',
  청두: 'chengdu',
  태항산: 'taihang',
  황산: 'huangshan',
  장가계: 'zhangjiajie',
  운남: 'yunnan',
  귀주: 'guizhou',
}

const CATALOG = GALLERY_PHOTOS as GalleryPhoto[]

export function sampleCoverPhotoId(sample: { id?: string; place?: string }): string {
  const id = (sample.id || '').trim()
  if (id && CATALOG.some((row) => row.id === id)) return id
  const place = (sample.place || '').split(/[·,]/)[0].trim()
  if (place && BY_PLACE[place]) return BY_PLACE[place]
  return 'shanghai'
}

export function sampleCover(sample: { id?: string; place?: string }, photos?: GalleryPhoto[]): string {
  const photoId = sampleCoverPhotoId(sample)
  if (photos?.length) {
    const found = photos.find((row) => row.id === photoId)
    if (found?.src) return found.src
  }
  const catalog = CATALOG.find((row) => row.id === photoId)
  return catalog?.src || CATALOG.find((row) => row.id === 'shanghai')?.src || ''
}
