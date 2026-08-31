import { DEST_AIRPORTS, ORIGIN_AIRPORTS, groupedAirports as groupAirports } from '../../data/airports'
import type { FlightOffer, HotelOffer } from '../../types'

export type FlightSearchResult = {
  offers: FlightOffer[]
  notice?: string
}

type HotelTemplate = {
  name: string
  city: string
  area: string
  stars: number
  nightly: number
  rating: number
  amenities: string[]
}

const HOTELS: HotelTemplate[] = [
  { name: '난바 오리엔탈 호텔', city: '오사카', area: '난바', stars: 4, nightly: 160000, rating: 8.7, amenities: ['역세권', '조식 선택', '24시 프론트'] },
  { name: '스위소텔 난카이 오사카', city: '오사카', area: '난바역 직결', stars: 5, nightly: 285000, rating: 9.1, amenities: ['역 직결', '수영장', '클럽 라운지'] },
  { name: '호텔 그레이서리 신사이바시', city: '오사카', area: '신사이바시', stars: 4, nightly: 178000, rating: 8.5, amenities: ['쇼핑 중심', '온센', '세탁'] },
  { name: '칸데오 호텔 오사카 남바', city: '오사카', area: '남바', stars: 3, nightly: 128000, rating: 8.3, amenities: ['옥상 온천', '컴팩트'] },
  { name: '모튼즈 고죠 호텔', city: '교토', area: '고조', stars: 3, nightly: 142000, rating: 8.6, amenities: ['마치야 감성', '카페'] },
  { name: '호텔 그랜비아 교토', city: '교토', area: '교토역', stars: 5, nightly: 268000, rating: 8.9, amenities: ['역 직결', '스파'] },
  { name: '세이잔소 가가츠엔', city: '교토', area: '히가시야마', stars: 4, nightly: 310000, rating: 9.2, amenities: ['료칸', '가이세키'] },
  { name: '세라 신주쿠', city: '도쿄', area: '신주쿠', stars: 3, nightly: 155000, rating: 8.2, amenities: ['24시', '캡슐 아님'] },
  { name: '게이오 플라자 호텔 도쿄', city: '도쿄', area: '니시신주쿠', stars: 5, nightly: 320000, rating: 8.8, amenities: ['전망', '이그제큐티브'] },
  { name: '미츠이 가든 긴자 프리미어', city: '도쿄', area: '긴자', stars: 4, nightly: 248000, rating: 8.7, amenities: ['긴자', '온천'] },
  { name: '더 블로스 후쿠오카', city: '후쿠오카', area: '텐진', stars: 4, nightly: 138000, rating: 8.6, amenities: ['텐진', '루프탑'] },
  { name: '호텔 니코 후쿠오카', city: '후쿠오카', area: '하카타', stars: 4, nightly: 164000, rating: 8.4, amenities: ['하카타역', '조식'] },
  { name: '시그니엘 서울', city: '서울', area: '잠실', stars: 5, nightly: 420000, rating: 9.0, amenities: ['한강 뷰', '클럽'] },
  { name: '나인트리 프리미어 명동', city: '서울', area: '명동', stars: 4, nightly: 168000, rating: 8.5, amenities: ['명동', '루프탑'] },
  { name: '파라다이스 호텔 부산', city: '부산', area: '해운대', stars: 5, nightly: 290000, rating: 8.8, amenities: ['오션뷰', '카지노'] },
  { name: '롯데 호텔 제주', city: '제주', area: '중문', stars: 5, nightly: 310000, rating: 8.6, amenities: ['리조트', '키즈'] },
  { name: '그랜드 하얏트 타이베이', city: '타이베이', area: '송산', stars: 5, nightly: 230000, rating: 8.7, amenities: ['쇼핑몰 연결'] },
  { name: '만다린 오리엔탈 방콕', city: '방콕', area: '차오프라야', stars: 5, nightly: 380000, rating: 9.3, amenities: ['강변', '스파'] },
  { name: '마리나베이 샌즈', city: '싱가포르', area: '마리나', stars: 5, nightly: 520000, rating: 9.1, amenities: ['인피니티 풀'] },
  { name: '빈펄 리조트 다낭', city: '다낭', area: '논느억', stars: 5, nightly: 210000, rating: 8.8, amenities: ['비치', '셔틀'] },
  { name: '더 페닌슐라 베이징', city: '베이징', area: '왕푸징', stars: 5, nightly: 380000, rating: 9.0, amenities: ['중심가', '스파'] },
  { name: '오포짓 하우스 싼리툰', city: '베이징', area: '싼리툰', stars: 4, nightly: 210000, rating: 8.4, amenities: ['나이트라이프'] },
  { name: '더 페닌슐라 상하이', city: '상하이', area: '외탄', stars: 5, nightly: 420000, rating: 9.2, amenities: ['외탄', '강뷰'] },
  { name: '진장 메트로폴로 상하이', city: '상하이', area: '인민광장', stars: 4, nightly: 198000, rating: 8.3, amenities: ['지하철'] },
  { name: '화이트 스완 광저우', city: '광저우', area: '사면', stars: 5, nightly: 240000, rating: 8.6, amenities: ['강변'] },
  { name: '더 베벌리 힐스 호텔', city: '로스앤젤레스', area: '베벌리힐스', stars: 5, nightly: 620000, rating: 9.0, amenities: ['풀', '할리우드'] },
  { name: '프리포트 인 산타모니카', city: '로스앤젤레스', area: '산타모니카', stars: 3, nightly: 280000, rating: 8.1, amenities: ['해변'] },
  { name: '더 플라자 뉴욕', city: '뉴욕', area: '센트럴파크', stars: 5, nightly: 780000, rating: 9.1, amenities: ['5번가'] },
  { name: '포 포인츠 타임스스퀘어', city: '뉴욕', area: '타임스스퀘어', stars: 4, nightly: 340000, rating: 8.2, amenities: ['브로드웨이'] },
  { name: '페어몬트 샌프란시스코', city: '샌프란시스코', area: '노브힐', stars: 5, nightly: 480000, rating: 8.8, amenities: ['전망'] },
  { name: '페어몬트 퍼시픽 림', city: '밴쿠버', area: '콜 하버', stars: 5, nightly: 410000, rating: 9.0, amenities: ['하버뷰'] },
  { name: '페어몬트 로열 요크', city: '토론토', area: '다운타운', stars: 5, nightly: 360000, rating: 8.7, amenities: ['유니언역'] },
]

function seed(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function vary(base: number, key: string, min = 0.82, max = 1.38): number {
  const n = seed(key) / 0xffffffff
  const factor = min + n * (max - min)
  const weekendBump = /[06]$/.test(key.slice(-1)) ? 1.12 : 1
  return Math.round((base * factor * weekendBump) / 1000) * 1000
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type FlightQuery = {
  from: string
  to: string
  date: string
}

export type HotelQuery = {
  city: string
  checkIn: string
  nights: number
}

export async function searchFlights(query: FlightQuery): Promise<FlightSearchResult> {
  try {
    const params = new URLSearchParams({
      from: query.from,
      to: query.to,
      date: query.date,
    })
    const res = await fetch(`/api/flights/search?${params}`, { cache: 'no-store' })
    const data = (await res.json()) as FlightSearchResult & { error?: string }
    if (!res.ok) throw new Error(data.error || '검색에 실패했습니다.')
    return {
      offers: Array.isArray(data.offers) ? data.offers : [],
      notice: data.notice,
    }
  } catch (err) {
    return {
      offers: [],
      notice: err instanceof Error ? err.message : '인천공항 시간표를 불러오지 못했습니다.',
    }
  }
}

export async function searchHotels(query: HotelQuery): Promise<HotelOffer[]> {
  await wait(380 + (seed(query.city + query.checkIn) % 240))
  const city = query.city.trim()
  const rows = HOTELS.filter((h) => !city || h.city.includes(city) || city.includes(h.city))
  return rows
    .map((h, i) => ({
      id: `${h.city}-${i}-${query.checkIn}`,
      name: h.name,
      city: h.city,
      area: h.area,
      stars: h.stars,
      nightly: vary(h.nightly, `${h.name}:${query.checkIn}:${query.nights}`, 0.88, 1.22),
      rating: h.rating,
      amenities: h.amenities,
    }))
    .sort((a, b) => a.nightly - b.nightly)
}

export function hotelCities(): string[] {
  return [...new Set(HOTELS.map((h) => h.city))]
}

export function groupedOrigins() {
  return groupAirports(ORIGIN_AIRPORTS)
}

export function groupedDestinations() {
  return groupAirports(DEST_AIRPORTS)
}
