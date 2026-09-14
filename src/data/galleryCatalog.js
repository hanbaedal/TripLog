function wm(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`
}

/** 도시 대표 사진 — 갤러리·여행정보 커버용 */
export const GALLERY_PHOTOS = [
  { id: 'beijing', title: '북경', src: '/samples/beijing.jpg', catalog: true, city: 'beijing', category: 'sight', sightType: 'palace' },
  { id: 'xian', title: '서안', src: wm('Terracotta Army.jpg'), catalog: true, city: 'xian', category: 'sight', sightType: 'palace' },
  { id: 'shanghai', title: '상하이', src: '/samples/shanghai.jpg', catalog: true, city: 'shanghai', category: 'sight', sightType: 'town' },
  { id: 'hongkong', title: '홍콩', src: '/samples/hongkong.jpg', catalog: true, city: 'hongkong', category: 'sight', sightType: 'town' },
  { id: 'zhangjiajie', title: '장가계', src: '/samples/zhangjiajie.jpg', catalog: true, city: 'zhangjiajie', category: 'sight', sightType: 'mountain' },
  { id: 'huangshan', title: '황산', src: '/samples/huangshan.jpg', catalog: true, city: 'huangshan', category: 'sight', sightType: 'mountain' },
  { id: 'chengdu', title: '청두', src: '/samples/chengdu.jpg', catalog: true, city: 'chengdu', category: 'sight', sightType: 'park' },
  { id: 'baekdusan', title: '백두산', src: '/samples/baekdusan.jpg', catalog: true, city: 'baekdusan', category: 'sight', sightType: 'lake' },
  { id: 'guizhou', title: '귀주', src: '/samples/guizhou.jpg', catalog: true, city: 'guizhou', category: 'sight', sightType: 'lake' },
  { id: 'yunnan', title: '운남', src: '/samples/yunnan.jpg', catalog: true, city: 'yunnan', category: 'sight', sightType: 'mountain' },
  { id: 'harbin', title: '하얼빈', src: '/samples/harbin.jpg', catalog: true, city: 'harbin', category: 'sight', sightType: 'temple' },
  { id: 'qingdao', title: '청도', src: '/samples/qingdao.jpg', catalog: true, city: 'qingdao', category: 'sight', sightType: 'beach' },
  { id: 'dalian', title: '대련', src: '/samples/dalian.jpg', catalog: true, city: 'dalian', category: 'sight', sightType: 'beach' },
  { id: 'yantai', title: '연태', src: '/samples/yantai.jpg', catalog: true, city: 'yantai', category: 'sight', sightType: 'beach' },
  { id: 'taihang', title: '태항산', src: '/samples/taihang.jpg', catalog: true, city: 'taihang', category: 'sight', sightType: 'mountain' },
]

/** 중국 대표 요리 — 갤러리 meal 카테고리 시드 */
export const FOOD_PHOTOS = [
  { id: 'food-beijingkaoya', title: '베이징 오리구이', src: wm('Peking duck.jpg'), catalog: true, city: 'beijing', category: 'meal' },
  { id: 'food-mapodoufu', title: '마파두부', src: wm('Mapo tofu.jpg'), catalog: true, city: 'chengdu', category: 'meal' },
  { id: 'food-gongbaojiding', title: '궁보계정', src: wm('Kung Pao chicken.jpg'), catalog: true, city: 'chengdu', category: 'meal' },
  { id: 'food-tangculiji', title: '탕추리지', src: wm('Sweet and sour pork.jpg'), catalog: true, city: 'shanghai', category: 'meal' },
  { id: 'food-huoguo', title: '훠궈', src: wm('Hot pot.jpg'), catalog: true, city: 'chengdu', category: 'meal' },
  { id: 'food-jiaozi', title: '교자', src: wm('Jiaozi.jpg'), catalog: true, city: 'harbin', category: 'meal' },
  { id: 'food-xiaolongbao', title: '샤오롱바오', src: wm('Xiaolongbao.jpg'), catalog: true, city: 'shanghai', category: 'meal' },
  { id: 'food-chaofan', title: '볶음밥', src: wm('Yangzhou fried rice.jpg'), catalog: true, city: 'shanghai', category: 'meal' },
  { id: 'food-chunjuan', title: '춘권', src: wm('Spring rolls.jpg'), catalog: true, city: 'hongkong', category: 'meal' },
  { id: 'food-lamian', title: '라면(手拉面)', src: wm('Lanzhou lamian.jpg'), catalog: true, city: 'xian', category: 'meal' },
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
