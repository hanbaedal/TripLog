export const GALLERY_PHOTOS = [
  { id: 'beijing', title: '북경 자금성', src: '/samples/beijing.jpg', catalog: true },
  {
    id: 'xian',
    title: '서안 병마용',
    src: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent('Terracotta Army.jpg')}?width=1400`,
    catalog: true,
  },
  { id: 'shanghai', title: '상하이 외탄', src: '/samples/shanghai.jpg', catalog: true },
  { id: 'hongkong', title: '홍콩 빅토리아피크', src: '/samples/hongkong.jpg', catalog: true },
  { id: 'zhangjiajie', title: '장가계', src: '/samples/zhangjiajie.jpg', catalog: true },
  { id: 'huangshan', title: '황산', src: '/samples/huangshan.jpg', catalog: true },
  { id: 'chengdu', title: '청두 판다', src: '/samples/chengdu.jpg', catalog: true },
  { id: 'baekdusan', title: '백두산 천지', src: '/samples/baekdusan.jpg', catalog: true },
  { id: 'guizhou', title: '황과수 대폭포', src: '/samples/guizhou.jpg', catalog: true },
  { id: 'yunnan', title: '석림', src: '/samples/yunnan.jpg', catalog: true },
  { id: 'harbin', title: '하얼빈 소피아', src: '/samples/harbin.jpg', catalog: true },
  { id: 'qingdao', title: '청도 잔차오', src: '/samples/qingdao.jpg', catalog: true },
  { id: 'dalian', title: '대련', src: '/samples/dalian.jpg', catalog: true },
  { id: 'yantai', title: '연태', src: '/samples/yantai.jpg', catalog: true },
  { id: 'taihang', title: '태항산', src: '/samples/taihang.jpg', catalog: true },
]

export const CITY_GALLERY_ID = {
  'info-dalian': 'dalian',
  'info-yantai': 'yantai',
  'info-qingdao': 'qingdao',
  'info-harbin': 'harbin',
  'info-beijing': 'beijing',
  'info-shanghai': 'shanghai',
  'info-hongkong': 'hongkong',
  'info-baekdusan': 'baekdusan',
  'info-xian': 'xian',
  'info-chengdu': 'chengdu',
  'info-taihang': 'taihang',
  'info-huangshan': 'huangshan',
  'info-zhangjiajie': 'zhangjiajie',
  'info-yunnan': 'yunnan',
  'info-guizhou': 'guizhou',
}

export function cityGalleryId(cityId) {
  return CITY_GALLERY_ID[cityId] || String(cityId || '').replace(/^info-/, '')
}
