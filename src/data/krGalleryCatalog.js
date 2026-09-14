/** 국내 갤러리 — 한국관광100선 권역·대표 명소 */

function wm(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`
}

export const KR_GALLERY_PHOTOS = [
  { id: 'kr-seoul', title: '서울', src: wm('Gyeongbokgung Palace Korea.jpg'), catalog: true, city: 'kr-seoul', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gangwon', title: '강원', src: wm('Seoraksan National Park Korea.jpg'), catalog: true, city: 'kr-gangwon', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-chungcheong', title: '충청', src: wm('Gongju Gongsanseong.jpg'), catalog: true, city: 'kr-chungcheong', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gyeonggi', title: '경기', src: wm('Suwon Hwaseong.jpg'), catalog: true, city: 'kr-gyeonggi', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gyeongsang', title: '경상', src: wm('Bulguksa Korea.jpg'), catalog: true, city: 'kr-gyeongsang', category: 'sight', sightType: 'temple', market: 'kr' },
  { id: 'kr-jeolla', title: '전라', src: wm('Jeonju Hanok Village.jpg'), catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'town', market: 'kr' },
  { id: 'kr-jeju', title: '제주', src: wm('Seongsan Ilchulbong.jpg'), catalog: true, city: 'kr-jeju', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-nami', title: '남이섬', src: wm('Nami Island Korea.jpg'), catalog: true, city: 'kr-gangwon', category: 'sight', sightType: 'park', market: 'kr' },
  { id: 'kr-seorak', title: '설악산', src: wm('Seoraksan Korea.jpg'), catalog: true, city: 'kr-gangwon', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-danyang', title: '단양 도담삼봉', src: wm('Danyang Korea.jpg'), catalog: true, city: 'kr-chungcheong', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-gongju', title: '공주 공산성', src: wm('Gongju Korea.jpg'), catalog: true, city: 'kr-chungcheong', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-heiri', title: '헤이리 예술마을', src: wm('Heyri Art Valley Korea.jpg'), catalog: true, city: 'kr-gyeonggi', category: 'sight', sightType: 'town', market: 'kr' },
  { id: 'kr-suwon', title: '수원 화성', src: wm('Hwaseong Fortress Korea.jpg'), catalog: true, city: 'kr-gyeonggi', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gyeongju', title: '경주 불국사', src: wm('Bulguksa temple Korea.jpg'), catalog: true, city: 'kr-gyeongsang', category: 'sight', sightType: 'temple', market: 'kr' },
  { id: 'kr-haeundae', title: '해운대', src: wm('Haeundae Beach Busan.jpg'), catalog: true, city: 'kr-gyeongsang', category: 'sight', sightType: 'beach', market: 'kr' },
  { id: 'kr-jeonju', title: '전주 한옥마을', src: wm('Jeonju Korea.jpg'), catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'town', market: 'kr' },
  { id: 'kr-suncheon', title: '순천만', src: wm('Suncheon Bay Korea.jpg'), catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'lake', market: 'kr' },
  { id: 'kr-yeosu', title: '여수 밤바다', src: wm('Yeosu night Korea.jpg'), catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'beach', market: 'kr' },
  { id: 'kr-udo', title: '우도', src: wm('Udo Island Jeju.jpg'), catalog: true, city: 'kr-jeju', category: 'sight', sightType: 'beach', market: 'kr' },
  { id: 'kr-hallasan', title: '한라산', src: wm('Hallasan Jeju.jpg'), catalog: true, city: 'kr-jeju', category: 'sight', sightType: 'mountain', market: 'kr' },
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
