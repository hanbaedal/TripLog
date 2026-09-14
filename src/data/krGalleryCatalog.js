/** 국내 갤러리 — 한국관광100선 권역·대표 명소 (Wikimedia Commons 검증 URL) */

const IMG = {
  seoul:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Gyeongbok-gung_palace.jpg/960px-Gyeongbok-gung_palace.jpg',
  gangwon:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Footbridge_at_Seoraksan_National_Park.jpg/960px-Footbridge_at_Seoraksan_National_Park.jpg',
  chungcheong:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/View_of_Gongju_02.jpg/960px-View_of_Gongju_02.jpg',
  gyeonggi:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Suwon_Hwaseong.jpg/960px-Suwon_Hwaseong.jpg',
  gyeongsang:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Korea-Gyeongju-Bulguksa-04.jpg/960px-Korea-Gyeongju-Bulguksa-04.jpg',
  jeolla:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Jeonju_Hanok_Maeul_02.jpg/960px-Jeonju_Hanok_Maeul_02.jpg',
  jeju:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Seongsan_Ilchulbong.jpg/960px-Seongsan_Ilchulbong.jpg',
  nami: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Namiseom_1.jpg',
  danyang:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Korea-Danyang-Dodamsambong_3087-07.JPG/960px-Korea-Danyang-Dodamsambong_3087-07.JPG',
  gongju:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/View_of_Gongju_02.jpg/960px-View_of_Gongju_02.jpg',
  heiri:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Heyri_flower.jpg/960px-Heyri_flower.jpg',
  suwon:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Suwon_Hwaseong.jpg/960px-Suwon_Hwaseong.jpg',
  gyeongju:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Korea-Gyeongju-Bulguksa-04.jpg/960px-Korea-Gyeongju-Bulguksa-04.jpg',
  haeundae:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Haeundae_Beach.jpg/960px-Haeundae_Beach.jpg',
  jeonju:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Jeonju_Hanok_Maeul_02.jpg/960px-Jeonju_Hanok_Maeul_02.jpg',
  suncheon:
    'https://upload.wikimedia.org/wikipedia/commons/4/43/Panorama_of_International_Garden_Exposition_Suncheon_Bay_Korea_2013.jpg',
  yeosu:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Yeosu_by_night_3.jpg/960px-Yeosu_by_night_3.jpg',
  udo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Udo%2C_Jeju_Province%2C_South_Korea_07.jpg/960px-Udo%2C_Jeju_Province%2C_South_Korea_07.jpg',
  hallasan:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Hallasan_Sunrise_07.jpg/960px-Hallasan_Sunrise_07.jpg',
}

export const KR_GALLERY_PHOTOS = [
  { id: 'kr-seoul', title: '서울', src: IMG.seoul, catalog: true, city: 'kr-seoul', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gangwon', title: '강원', src: IMG.gangwon, catalog: true, city: 'kr-gangwon', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-chungcheong', title: '충청', src: IMG.chungcheong, catalog: true, city: 'kr-chungcheong', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gyeonggi', title: '경기', src: IMG.gyeonggi, catalog: true, city: 'kr-gyeonggi', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gyeongsang', title: '경상', src: IMG.gyeongsang, catalog: true, city: 'kr-gyeongsang', category: 'sight', sightType: 'temple', market: 'kr' },
  { id: 'kr-jeolla', title: '전라', src: IMG.jeolla, catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'town', market: 'kr' },
  { id: 'kr-jeju', title: '제주', src: IMG.jeju, catalog: true, city: 'kr-jeju', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-nami', title: '남이섬', src: IMG.nami, catalog: true, city: 'kr-gangwon', category: 'sight', sightType: 'park', market: 'kr' },
  { id: 'kr-seorak', title: '설악산', src: IMG.gangwon, catalog: true, city: 'kr-gangwon', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-danyang', title: '단양 도담삼봉', src: IMG.danyang, catalog: true, city: 'kr-chungcheong', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-gongju', title: '공주 공산성', src: IMG.gongju, catalog: true, city: 'kr-chungcheong', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-heiri', title: '헤이리 예술마을', src: IMG.heiri, catalog: true, city: 'kr-gyeonggi', category: 'sight', sightType: 'town', market: 'kr' },
  { id: 'kr-suwon', title: '수원 화성', src: IMG.suwon, catalog: true, city: 'kr-gyeonggi', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gyeongju', title: '경주 불국사', src: IMG.gyeongju, catalog: true, city: 'kr-gyeongsang', category: 'sight', sightType: 'temple', market: 'kr' },
  { id: 'kr-haeundae', title: '해운대', src: IMG.haeundae, catalog: true, city: 'kr-gyeongsang', category: 'sight', sightType: 'beach', market: 'kr' },
  { id: 'kr-jeonju', title: '전주 한옥마을', src: IMG.jeonju, catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'town', market: 'kr' },
  { id: 'kr-suncheon', title: '순천만', src: IMG.suncheon, catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'lake', market: 'kr' },
  { id: 'kr-yeosu', title: '여수 밤바다', src: IMG.yeosu, catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'beach', market: 'kr' },
  { id: 'kr-udo', title: '우도', src: IMG.udo, catalog: true, city: 'kr-jeju', category: 'sight', sightType: 'beach', market: 'kr' },
  { id: 'kr-hallasan', title: '한라산', src: IMG.hallasan, catalog: true, city: 'kr-jeju', category: 'sight', sightType: 'mountain', market: 'kr' },
]

export const KR_GALLERY_CITIES = [
  { slug: 'kr-seoul', label: '서울' },
  { slug: 'kr-gangwon', label: '강원' },
  { slug: 'kr-chungcheong', label: '충청' },
  { slug: 'kr-gyeonggi', label: '경기' },
  { slug: 'kr-gyeongsang', label: '경상' },
  { slug: 'kr-jeolla', label: '전라' },
  { slug: 'kr-jeju', label: '제주' },
]
