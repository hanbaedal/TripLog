export type Airport = {
  code: string
  city: string
  name: string
  country: string
}

export const ORIGIN_AIRPORTS: Airport[] = [
  { code: 'ICN', city: '서울', name: '인천', country: '한국' },
  { code: 'GMP', city: '서울', name: '김포', country: '한국' },
]

export const DEST_AIRPORTS: Airport[] = [
  { code: 'CAN', city: '광저우', name: '바이윈', country: '중국' },
  { code: 'NKG', city: '난징', name: '루커우', country: '중국' },
  { code: 'NTG', city: '난통', name: '싱둥', country: '중국' },
  { code: 'NGB', city: '닝보', name: '리서', country: '중국' },
  { code: 'DLC', city: '다롄', name: '저우수이쯔', country: '중국' },
  { code: 'DAT', city: '다퉁', name: '윈강', country: '중국' },
  { code: 'LYI', city: '린이', name: '치양', country: '중국' },
  { code: 'PKX', city: '베이징', name: '다싱', country: '중국' },
  { code: 'PEK', city: '베이징', name: '서우두', country: '중국' },
  { code: 'PVG', city: '상하이', name: '푸동', country: '중국' },
  { code: 'SHA', city: '상하이', name: '훙차오', country: '중국' },
  { code: 'XMN', city: '샤먼', name: '가오치', country: '중국' },
  { code: 'SHE', city: '선양', name: '타오셴', country: '중국' },
  { code: 'SZX', city: '선전', name: '바오안', country: '중국' },
  { code: 'SJW', city: '스자좡', name: '정딩', country: '중국' },
  { code: 'XIY', city: '시안', name: '셴양', country: '중국' },
  { code: 'SYX', city: '싼야', name: '봉황', country: '중국' },
  { code: 'YTY', city: '양저우', name: '타이저우', country: '중국' },
  { code: 'YNJ', city: '옌지', name: '차오양촨', country: '중국' },
  { code: 'YNZ', city: '옌청', name: '난양', country: '중국' },
  { code: 'YNT', city: '옌타이', name: '펑라이', country: '중국' },
  { code: 'DSN', city: '오르도스', name: '어얼둬쓰', country: '중국' },
  { code: 'URC', city: '우루무치', name: '디워푸', country: '중국' },
  { code: 'WUX', city: '우시', name: '슈오팡', country: '중국' },
  { code: 'WUH', city: '우한', name: '톈허', country: '중국' },
  { code: 'WNZ', city: '원저우', name: '룽완', country: '중국' },
  { code: 'WEH', city: '웨이하이', name: '다슈이보', country: '중국' },
  { code: 'YCU', city: '윈청', name: '옌후', country: '중국' },
  { code: 'JMU', city: '자무쓰', name: '둥자오', country: '중국' },
  { code: 'DYG', city: '장가계', name: '허화', country: '중국' },
  { code: 'CSX', city: '장사', name: '황화', country: '중국' },
  { code: 'CGO', city: '정저우', name: '신정', country: '중국' },
  { code: 'TNA', city: '지난', name: '야오창', country: '중국' },
  { code: 'CGQ', city: '창춘', name: '룽자', country: '중국' },
  { code: 'TFU', city: '청두', name: '톈푸', country: '중국' },
  { code: 'CKG', city: '충칭', name: '장베이', country: '중국' },
  { code: 'TAO', city: '칭다오', name: '자오둥', country: '중국' },
  { code: 'KMG', city: '쿤밍', name: '창수이', country: '중국' },
  { code: 'TSN', city: '톈진', name: '빈하이', country: '중국' },
  { code: 'FOC', city: '푸저우', name: '창러', country: '중국' },
  { code: 'HRB', city: '하얼빈', name: '타이핑', country: '중국' },
  { code: 'HAK', city: '하이커우', name: '메이란', country: '중국' },
  { code: 'HGH', city: '항저우', name: '샤오산', country: '중국' },
  { code: 'HFE', city: '허페이', name: '신차오', country: '중국' },
  { code: 'HLD', city: '하이라얼', name: '둥산', country: '중국' },
  { code: 'HET', city: '후허하오터', name: '바이타', country: '중국' },
  { code: 'HKG', city: '홍콩', name: '홍콩', country: '홍콩' },
  { code: 'MFM', city: '마카오', name: '마카오', country: '마카오' },
  { code: 'TPE', city: '타이베이', name: '타오위안', country: '대만' },
  { code: 'KHH', city: '가오슝', name: '가오슝', country: '대만' },
  { code: 'RMQ', city: '타이중', name: '칭촨강', country: '대만' },
]

export const AIRPORTS: Airport[] = [...ORIGIN_AIRPORTS, ...DEST_AIRPORTS]

export const DEST_CODES = new Set(DEST_AIRPORTS.map((a) => a.code))

export function airportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code)
}

export function cityOf(code: string): string {
  return airportByCode(code)?.city ?? code
}

export function groupedAirports(list: Airport[]) {
  const groups = new Map<string, Airport[]>()
  for (const a of list) {
    const rows = groups.get(a.country) ?? []
    rows.push(a)
    groups.set(a.country, rows)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ko'))
    .map(
      ([country, rows]) =>
        [
          country,
          [...rows].sort(
            (x, y) => x.city.localeCompare(y.city, 'ko') || x.name.localeCompare(y.name, 'ko'),
          ),
        ] as const,
    )
}
