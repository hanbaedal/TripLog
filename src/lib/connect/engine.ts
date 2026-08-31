import { AIRPORTS, cityOf } from '../../data/airports'
import type { FlightOffer, HotelOffer } from '../../types'

type FlightTemplate = {
  from: string
  to: string
  airline: string
  airlineCode: string
  flightNo: string
  depart: string
  arrive: string
  plusDay?: number
  duration: string
  base: number
}

const FLIGHTS: FlightTemplate[] = [
  { from: 'ICN', to: 'KIX', airline: '대한항공', airlineCode: 'KE', flightNo: '723', depart: '07:55', arrive: '09:35', duration: '1시간 40분', base: 168000 },
  { from: 'ICN', to: 'KIX', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '114', depart: '09:20', arrive: '11:05', duration: '1시간 45분', base: 154000 },
  { from: 'ICN', to: 'KIX', airline: '제주항공', airlineCode: '7C', flightNo: '1304', depart: '12:40', arrive: '14:15', duration: '1시간 35분', base: 98000 },
  { from: 'ICN', to: 'KIX', airline: '티웨이항공', airlineCode: 'TW', flightNo: '285', depart: '16:10', arrive: '17:50', duration: '1시간 40분', base: 92000 },
  { from: 'ICN', to: 'KIX', airline: '피치항공', airlineCode: 'MM', flightNo: '702', depart: '19:30', arrive: '21:10', duration: '1시간 40분', base: 79000 },
  { from: 'KIX', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '728', depart: '16:25', arrive: '18:10', duration: '1시간 45분', base: 168000 },
  { from: 'KIX', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '115', depart: '12:05', arrive: '13:50', duration: '1시간 45분', base: 154000 },
  { from: 'KIX', to: 'ICN', airline: '제주항공', airlineCode: '7C', flightNo: '1305', depart: '20:40', arrive: '22:20', duration: '1시간 40분', base: 98000 },
  { from: 'KIX', to: 'ICN', airline: '티웨이항공', airlineCode: 'TW', flightNo: '286', depart: '10:20', arrive: '12:05', duration: '1시간 45분', base: 92000 },
  { from: 'ICN', to: 'NRT', airline: '대한항공', airlineCode: 'KE', flightNo: '703', depart: '08:10', arrive: '10:35', duration: '2시간 25분', base: 210000 },
  { from: 'ICN', to: 'NRT', airline: '진에어', airlineCode: 'LJ', flightNo: '201', depart: '13:50', arrive: '16:20', duration: '2시간 30분', base: 132000 },
  { from: 'NRT', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '704', depart: '17:40', arrive: '20:15', duration: '2시간 35분', base: 210000 },
  { from: 'NRT', to: 'ICN', airline: '진에어', airlineCode: 'LJ', flightNo: '202', depart: '11:10', arrive: '13:40', duration: '2시간 30분', base: 132000 },
  { from: 'GMP', to: 'HND', airline: '대한항공', airlineCode: 'KE', flightNo: '2101', depart: '08:00', arrive: '10:10', duration: '2시간 10분', base: 198000 },
  { from: 'GMP', to: 'HND', airline: '일본항공', airlineCode: 'JL', flightNo: '92', depart: '14:30', arrive: '16:40', duration: '2시간 10분', base: 205000 },
  { from: 'HND', to: 'GMP', airline: '대한항공', airlineCode: 'KE', flightNo: '2102', depart: '18:20', arrive: '20:35', duration: '2시간 15분', base: 198000 },
  { from: 'HND', to: 'GMP', airline: '일본항공', airlineCode: 'JL', flightNo: '93', depart: '11:00', arrive: '13:20', duration: '2시간 20분', base: 205000 },
  { from: 'ICN', to: 'HND', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '1046', depart: '07:40', arrive: '10:05', duration: '2시간 25분', base: 188000 },
  { from: 'HND', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '1047', depart: '19:10', arrive: '21:40', duration: '2시간 30분', base: 188000 },
  { from: 'ICN', to: 'FUK', airline: '에어부산', airlineCode: 'BX', flightNo: '172', depart: '09:15', arrive: '10:30', duration: '1시간 15분', base: 89000 },
  { from: 'FUK', to: 'ICN', airline: '에어부산', airlineCode: 'BX', flightNo: '173', depart: '18:50', arrive: '20:10', duration: '1시간 20분', base: 89000 },
  { from: 'PUS', to: 'KIX', airline: '에어부산', airlineCode: 'BX', flightNo: '180', depart: '10:05', arrive: '11:20', duration: '1시간 15분', base: 76000 },
  { from: 'KIX', to: 'PUS', airline: '에어부산', airlineCode: 'BX', flightNo: '181', depart: '15:40', arrive: '16:55', duration: '1시간 15분', base: 76000 },
  { from: 'ICN', to: 'TPE', airline: '대한항공', airlineCode: 'KE', flightNo: '693', depart: '08:25', arrive: '10:10', duration: '2시간 45분', base: 176000 },
  { from: 'TPE', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '694', depart: '14:20', arrive: '18:00', duration: '2시간 40분', base: 176000 },
  { from: 'ICN', to: 'BKK', airline: '대한항공', airlineCode: 'KE', flightNo: '651', depart: '17:50', arrive: '21:30', duration: '5시간 40분', base: 248000 },
  { from: 'BKK', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '652', depart: '23:20', arrive: '06:50', plusDay: 1, duration: '5시간 30분', base: 248000 },
  { from: 'ICN', to: 'SIN', airline: '싱가포르항공', airlineCode: 'SQ', flightNo: '609', depart: '16:05', arrive: '21:40', duration: '6시간 35분', base: 312000 },
  { from: 'SIN', to: 'ICN', airline: '싱가포르항공', airlineCode: 'SQ', flightNo: '608', depart: '01:15', arrive: '08:50', duration: '6시간 35분', base: 312000 },
  { from: 'ICN', to: 'DAD', airline: '제주항공', airlineCode: '7C', flightNo: '2903', depart: '07:20', arrive: '10:15', duration: '4시간 55분', base: 142000 },
  { from: 'DAD', to: 'ICN', airline: '제주항공', airlineCode: '7C', flightNo: '2904', depart: '11:20', arrive: '17:10', duration: '4시간 50분', base: 142000 },
  { from: 'GMP', to: 'CJU', airline: '대한항공', airlineCode: 'KE', flightNo: '1211', depart: '07:00', arrive: '08:10', duration: '1시간 10분', base: 68000 },
  { from: 'CJU', to: 'GMP', airline: '대한항공', airlineCode: 'KE', flightNo: '1218', depart: '19:40', arrive: '20:50', duration: '1시간 10분', base: 68000 },
  { from: 'PUS', to: 'CJU', airline: '진에어', airlineCode: 'LJ', flightNo: '511', depart: '09:30', arrive: '10:25', duration: '55분', base: 52000 },
  { from: 'CJU', to: 'PUS', airline: '진에어', airlineCode: 'LJ', flightNo: '512', depart: '16:10', arrive: '17:05', duration: '55분', base: 52000 },
  { from: 'ICN', to: 'HKG', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '721', depart: '09:40', arrive: '12:35', duration: '3시간 55분', base: 198000 },
  { from: 'HKG', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '722', depart: '14:20', arrive: '18:50', duration: '3시간 30분', base: 198000 },
]

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

export async function searchFlights(query: FlightQuery): Promise<FlightOffer[]> {
  await wait(420 + (seed(query.date + query.from + query.to) % 280))
  const rows = FLIGHTS.filter((f) => f.from === query.from && f.to === query.to)
  return rows.map((f, i) => {
    const price = vary(f.base, `${query.date}:${f.airlineCode}${f.flightNo}`)
    return {
      id: `${f.airlineCode}${f.flightNo}-${query.date}-${i}`,
      airline: f.airline,
      airlineCode: f.airlineCode,
      flightNo: f.flightNo,
      from: f.from,
      to: f.to,
      fromCity: cityOf(f.from),
      toCity: cityOf(f.to),
      date: query.date,
      depart: f.depart,
      arrive: f.arrive,
      plusDay: f.plusDay ?? 0,
      duration: f.duration,
      stops: 0,
      cabin: '이코노미',
      price,
      seats: 3 + (seed(query.date + f.flightNo) % 9),
    }
  }).sort((a, b) => a.price - b.price)
}

export async function searchHotels(query: HotelQuery): Promise<HotelOffer[]> {
  await wait(380 + (seed(query.city + query.checkIn) % 240))
  const city = query.city.trim()
  const rows = HOTELS.filter((h) => !city || h.city.includes(city) || city.includes(h.city))
  return rows.map((h, i) => ({
    id: `${h.city}-${i}-${query.checkIn}`,
    name: h.name,
    city: h.city,
    area: h.area,
    stars: h.stars,
    nightly: vary(h.nightly, `${h.name}:${query.checkIn}:${query.nights}`, 0.88, 1.22),
    rating: h.rating,
    amenities: h.amenities,
  })).sort((a, b) => a.nightly - b.nightly)
}

export function hotelCities(): string[] {
  return [...new Set(HOTELS.map((h) => h.city))]
}

export function groupedAirports() {
  const groups = new Map<string, typeof AIRPORTS>()
  for (const a of AIRPORTS) {
    const list = groups.get(a.country) ?? []
    list.push(a)
    groups.set(a.country, list)
  }
  return [...groups.entries()]
}
