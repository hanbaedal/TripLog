/** 국내 갤러리 — /public/samples 자체 호스팅 (중국 갤러리와 동일 방식) */

function sampleSrc(id) {
  return `/samples/${id}.jpg`
}

export const KR_GALLERY_PHOTOS = [
  { id: 'kr-seoul', title: '서울', src: sampleSrc('kr-seoul'), catalog: true, city: 'kr-seoul', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gangwon', title: '강원', src: sampleSrc('kr-gangwon'), catalog: true, city: 'kr-gangwon', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-chungcheong', title: '충청', src: sampleSrc('kr-chungcheong'), catalog: true, city: 'kr-chungcheong', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gyeonggi', title: '경기', src: sampleSrc('kr-gyeonggi'), catalog: true, city: 'kr-gyeonggi', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gyeongsang', title: '경상', src: sampleSrc('kr-gyeongsang'), catalog: true, city: 'kr-gyeongsang', category: 'sight', sightType: 'temple', market: 'kr' },
  { id: 'kr-jeolla', title: '전라', src: sampleSrc('kr-jeolla'), catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'town', market: 'kr' },
  { id: 'kr-jeju', title: '제주', src: sampleSrc('kr-jeju'), catalog: true, city: 'kr-jeju', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-nami', title: '남이섬', src: sampleSrc('kr-nami'), catalog: true, city: 'kr-gangwon', category: 'sight', sightType: 'park', market: 'kr' },
  { id: 'kr-seorak', title: '설악산', src: sampleSrc('kr-seorak'), catalog: true, city: 'kr-gangwon', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-danyang', title: '단양 도담삼봉', src: sampleSrc('kr-danyang'), catalog: true, city: 'kr-chungcheong', category: 'sight', sightType: 'mountain', market: 'kr' },
  { id: 'kr-gongju', title: '공주 공산성', src: sampleSrc('kr-gongju'), catalog: true, city: 'kr-chungcheong', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-heiri', title: '헤이리 예술마을', src: sampleSrc('kr-heiri'), catalog: true, city: 'kr-gyeonggi', category: 'sight', sightType: 'town', market: 'kr' },
  { id: 'kr-suwon', title: '수원 화성', src: sampleSrc('kr-suwon'), catalog: true, city: 'kr-gyeonggi', category: 'sight', sightType: 'palace', market: 'kr' },
  { id: 'kr-gyeongju', title: '경주 불국사', src: sampleSrc('kr-gyeongju'), catalog: true, city: 'kr-gyeongsang', category: 'sight', sightType: 'temple', market: 'kr' },
  { id: 'kr-haeundae', title: '해운대', src: sampleSrc('kr-haeundae'), catalog: true, city: 'kr-gyeongsang', category: 'sight', sightType: 'beach', market: 'kr' },
  { id: 'kr-jeonju', title: '전주 한옥마을', src: sampleSrc('kr-jeonju'), catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'town', market: 'kr' },
  { id: 'kr-suncheon', title: '순천만', src: sampleSrc('kr-suncheon'), catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'lake', market: 'kr' },
  { id: 'kr-yeosu', title: '여수 밤바다', src: sampleSrc('kr-yeosu'), catalog: true, city: 'kr-jeolla', category: 'sight', sightType: 'beach', market: 'kr' },
  { id: 'kr-udo', title: '우도', src: sampleSrc('kr-udo'), catalog: true, city: 'kr-jeju', category: 'sight', sightType: 'beach', market: 'kr' },
  { id: 'kr-hallasan', title: '한라산', src: sampleSrc('kr-hallasan'), catalog: true, city: 'kr-jeju', category: 'sight', sightType: 'mountain', market: 'kr' },
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
