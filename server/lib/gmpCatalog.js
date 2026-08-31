const GMP_ROWS = [
  { to: 'SHA', airline: '대한항공', airlineCode: 'KE', flightNo: '2117', depart: '08:00' },
  { to: 'SHA', airline: '대한항공', airlineCode: 'KE', flightNo: '2115', depart: '11:10' },
  { to: 'SHA', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '1091', depart: '09:20' },
  { to: 'SHA', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '1093', depart: '14:40' },
  { to: 'SHA', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5052', depart: '08:40' },
  { to: 'SHA', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5054', depart: '13:00' },
  { to: 'SHA', airline: '상하이항공', airlineCode: 'FM', flightNo: '8232', depart: '16:30' },
  { to: 'PEK', airline: '대한항공', airlineCode: 'KE', flightNo: '2103', depart: '08:30' },
  { to: 'PEK', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '331', depart: '10:15' },
  { to: 'PEK', airline: '중국국제항공', airlineCode: 'CA', flightNo: '126', depart: '12:50' },
  { to: 'PEK', airline: '중국국제항공', airlineCode: 'CA', flightNo: '128', depart: '17:20' },
  { to: 'TPE', airline: '대한항공', airlineCode: 'KE', flightNo: '2135', depart: '07:50' },
  { to: 'TPE', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '711', depart: '12:10' },
  { to: 'TPE', airline: '중화항공', airlineCode: 'CI', flightNo: '160', depart: '15:40' },
  { to: 'HKG', airline: '대한항공', airlineCode: 'KE', flightNo: '2121', depart: '09:00' },
  { to: 'HKG', airline: '캐세이퍼시픽항공', airlineCode: 'CX', flightNo: '411', depart: '13:20' },
  { to: 'MFM', airline: '에어마카오', airlineCode: 'NX', flightNo: '822', depart: '11:40' },
]

const CITY = {
  SHA: '상하이',
  PEK: '베이징',
  TPE: '타이베이',
  HKG: '홍콩',
  MFM: '마카오',
}

export function gmpFlights(to) {
  return GMP_ROWS.filter((row) => row.to === to).map((row) => ({
    ...row,
    from: 'GMP',
    toCity: CITY[row.to] || row.to,
    terminal: '',
    codeshare: false,
    status: '',
  }))
}
