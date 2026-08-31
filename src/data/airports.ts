export type Airport = {
  code: string
  city: string
  name: string
  country: string
}

export const AIRPORTS: Airport[] = [
  { code: 'ICN', city: '서울', name: '인천', country: '한국' },
  { code: 'GMP', city: '서울', name: '김포', country: '한국' },
  { code: 'PUS', city: '부산', name: '김해', country: '한국' },
  { code: 'CJU', city: '제주', name: '제주', country: '한국' },
  { code: 'KIX', city: '오사카', name: '간사이', country: '일본' },
  { code: 'ITM', city: '오사카', name: '이타미', country: '일본' },
  { code: 'NRT', city: '도쿄', name: '나리타', country: '일본' },
  { code: 'HND', city: '도쿄', name: '하네다', country: '일본' },
  { code: 'FUK', city: '후쿠오카', name: '후쿠오카', country: '일본' },
  { code: 'NGO', city: '나고야', name: '주부', country: '일본' },
  { code: 'CTS', city: '삿포로', name: '신치토세', country: '일본' },
  { code: 'OKA', city: '오키나와', name: '나하', country: '일본' },
  { code: 'TPE', city: '타이베이', name: '타오위안', country: '대만' },
  { code: 'HKG', city: '홍콩', name: '홍콩', country: '홍콩' },
  { code: 'BKK', city: '방콕', name: '수완나품', country: '태국' },
  { code: 'SIN', city: '싱가포르', name: '창이', country: '싱가포르' },
  { code: 'DAD', city: '다낭', name: '다낭', country: '베트남' },
  { code: 'SGN', city: '호치민', name: '탄손낫', country: '베트남' },
  { code: 'HAN', city: '하노이', name: '노이바이', country: '베트남' },
  { code: 'PEK', city: '베이징', name: '서우두', country: '중국' },
  { code: 'PKX', city: '베이징', name: '다싱', country: '중국' },
  { code: 'PVG', city: '상하이', name: '푸동', country: '중국' },
  { code: 'SHA', city: '상하이', name: '훙차오', country: '중국' },
  { code: 'CAN', city: '광저우', name: '바이윈', country: '중국' },
  { code: 'SZX', city: '선전', name: '바오안', country: '중국' },
  { code: 'TAO', city: '칭다오', name: '자오둥', country: '중국' },
  { code: 'CTU', city: '청두', name: '솽류', country: '중국' },
  { code: 'XIY', city: '시안', name: '셴양', country: '중국' },
  { code: 'LAX', city: '로스앤젤레스', name: '국제공항', country: '미국' },
  { code: 'SFO', city: '샌프란시스코', name: '국제공항', country: '미국' },
  { code: 'SEA', city: '시애틀', name: '터코마', country: '미국' },
  { code: 'JFK', city: '뉴욕', name: '케네디', country: '미국' },
  { code: 'EWR', city: '뉴욕', name: '뉴어크', country: '미국' },
  { code: 'ORD', city: '시카고', name: '오헤어', country: '미국' },
  { code: 'DFW', city: '댈러스', name: '포트워스', country: '미국' },
  { code: 'HNL', city: '호놀룰루', name: '대니얼 이노우예', country: '미국' },
  { code: 'LAS', city: '라스베이거스', name: '해리 리드', country: '미국' },
  { code: 'YVR', city: '밴쿠버', name: '국제공항', country: '캐나다' },
  { code: 'YYZ', city: '토론토', name: '피어슨', country: '캐나다' },
  { code: 'YUL', city: '몬트리올', name: '트뤼도', country: '캐나다' },
  { code: 'YYC', city: '캘거리', name: '국제공항', country: '캐나다' },
]

export function airportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code)
}

export function cityOf(code: string): string {
  return airportByCode(code)?.city ?? code
}
