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
]

export function airportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code)
}

export function cityOf(code: string): string {
  return airportByCode(code)?.city ?? code
}
