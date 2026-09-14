function wm(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`
}

/** 도시 대표 사진 — 갤러리·여행정보 커버용 */
export const GALLERY_PHOTOS = [
  { id: 'beijing', title: '北京', src: '/samples/beijing.jpg', catalog: true, city: 'beijing', category: 'sight', sightType: 'palace' },
  { id: 'xian', title: '西安', src: wm('Terracotta Army.jpg'), catalog: true, city: 'xian', category: 'sight', sightType: 'palace' },
  { id: 'shanghai', title: '上海', src: '/samples/shanghai.jpg', catalog: true, city: 'shanghai', category: 'sight', sightType: 'town' },
  { id: 'hongkong', title: '香港', src: '/samples/hongkong.jpg', catalog: true, city: 'hongkong', category: 'sight', sightType: 'town' },
  { id: 'zhangjiajie', title: '张家界', src: '/samples/zhangjiajie.jpg', catalog: true, city: 'zhangjiajie', category: 'sight', sightType: 'mountain' },
  { id: 'huangshan', title: '黄山', src: '/samples/huangshan.jpg', catalog: true, city: 'huangshan', category: 'sight', sightType: 'mountain' },
  { id: 'chengdu', title: '成都', src: '/samples/chengdu.jpg', catalog: true, city: 'chengdu', category: 'sight', sightType: 'park' },
  { id: 'baekdusan', title: '长白山', src: '/samples/baekdusan.jpg', catalog: true, city: 'baekdusan', category: 'sight', sightType: 'lake' },
  { id: 'guizhou', title: '贵州', src: '/samples/guizhou.jpg', catalog: true, city: 'guizhou', category: 'sight', sightType: 'lake' },
  { id: 'yunnan', title: '云南', src: '/samples/yunnan.jpg', catalog: true, city: 'yunnan', category: 'sight', sightType: 'mountain' },
  { id: 'harbin', title: '하얼빈', src: '/samples/harbin.jpg', catalog: true, city: 'harbin', category: 'sight', sightType: 'temple' },
  { id: 'qingdao', title: '청도', src: '/samples/qingdao.jpg', catalog: true, city: 'qingdao', category: 'sight', sightType: 'beach' },
  { id: 'dalian', title: '대련', src: '/samples/dalian.jpg', catalog: true, city: 'dalian', category: 'sight', sightType: 'beach' },
  { id: 'yantai', title: '연태', src: '/samples/yantai.jpg', catalog: true, city: 'yantai', category: 'sight', sightType: 'beach' },
  { id: 'taihang', title: '太行山', src: '/samples/taihang.jpg', catalog: true, city: 'taihang', category: 'sight', sightType: 'mountain' },
]

/** 중국 대표 요리 — 갤러리 meal 카테고리 시드 */
export const FOOD_PHOTOS = [
  { id: 'food-beijingkaoya', title: '베이징 오리구이', src: '/samples/food/food-beijingkaoya.jpg', catalog: true, city: 'beijing', category: 'meal' },
  { id: 'food-mapodoufu', title: '마파두부', src: '/samples/food/food-mapodoufu.jpg', catalog: true, city: 'chengdu', category: 'meal' },
  { id: 'food-gongbaojiding', title: '궁보계정', src: '/samples/food/food-gongbaojiding.jpg', catalog: true, city: 'chengdu', category: 'meal' },
  { id: 'food-tangculiji', title: '탕추리지', src: '/samples/food/food-tangculiji.jpg', catalog: true, city: 'shanghai', category: 'meal' },
  { id: 'food-huoguo', title: '훠궈', src: '/samples/food/food-huoguo.jpg', catalog: true, city: 'chengdu', category: 'meal' },
  { id: 'food-jiaozi', title: '교자', src: '/samples/food/food-jiaozi.jpg', catalog: true, city: 'harbin', category: 'meal' },
  { id: 'food-xiaolongbao', title: '샤오롱바오', src: '/samples/food/food-xiaolongbao.jpg', catalog: true, city: 'shanghai', category: 'meal' },
  { id: 'food-chaofan', title: '볶음밥', src: '/samples/food/food-chaofan.jpg', catalog: true, city: 'shanghai', category: 'meal' },
  { id: 'food-chunjuan', title: '춘권', src: '/samples/food/food-chunjuan.jpg', catalog: true, city: 'hongkong', category: 'meal' },
  { id: 'food-lamian', title: '라면(手拉面)', src: '/samples/food/food-lamian.jpg', catalog: true, city: 'xian', category: 'meal' },
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
