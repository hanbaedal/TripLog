/** 국내 2박 3일 권역별 추천 — 한국관광100선(2025·2026) + 권역 코스 참고 */

function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function row(id, dayIndex, time, kind, title, extra = {}) {
  return { id, dayIndex, time, kind, title, cost: 0, ...extra }
}

function buildKrSample({
  id,
  sort,
  nights,
  place,
  title,
  region,
  hotel,
  hotelPlace,
  nightly,
  departNote = '서울 · 자차/렌터카 출발',
  departCost = 0,
  days,
  flightOut,
  flightIn,
  airline,
  airport,
  airportName,
}) {
  const start = '2026-09-15'
  const items = []
  const lastDay = nights

  if (flightOut) {
    items.push(
      row(`${id}-f0`, 0, '08:10', 'flight', `${flightOut} 김포 → ${place}`, {
        subtitle: airline,
        place: `GMP 08:10 → ${airport} 09:20`,
        cost: 98000,
        flight: {
          flightNo: flightOut,
          airline,
          destination: `${place} (${airport})`,
          arriveTime: '09:20',
          departTerminal: '국내선',
        },
      }),
    )
    items.push(
      row(`${id}-t0`, 0, '09:40', 'transport', '공항 렌터카', {
        transportMode: 'taxi',
        place: `${airportName} → 1일차`,
        cost: 45000,
        note: '완전자차 보험 권장',
      }),
    )
  } else {
    items.push(
      row(`${id}-dep`, 0, '07:30', 'transport', departNote, {
        transportMode: 'taxi',
        place: '서울 → 1일차 첫 목적지',
        cost: departCost,
      }),
    )
  }

  for (let d = 0; d < nights; d++) {
    const day = days[d] || days[days.length - 1]
    const stayName = day.hotel || hotel
    const stayPlace = day.hotelPlace || hotelPlace
    const stayCost = day.nightly ?? nightly
    items.push(
      row(`${id}-h${d}`, d, d === 0 ? '18:00' : '15:00', 'hotel', stayName, {
        place: stayPlace,
        cost: stayCost,
      }),
    )
    if (day.transport) {
      items.push(
        row(`${id}-tr${d}`, d, day.transportTime || '09:00', 'transport', day.transport, {
          transportMode: day.transportMode || 'taxi',
          place: day.transportPlace || '',
          cost: day.transportCost || 32000,
          note: day.transportNote,
        }),
      )
    }
    const sights = day.sights || (day.sight ? [day.sight] : [])
    sights.forEach((sight, i) => {
      const sightTitle = typeof sight === 'string' ? sight : sight.title
      const sightPlace = typeof sight === 'string' ? day.sightPlace || '' : sight.place || day.sightPlace || ''
      const hour = 9 + i * 2
      items.push(
        row(`${id}-s${d}-${i}`, d, `${String(hour).padStart(2, '0')}:30`, 'sight', sightTitle, {
          place: sightPlace,
          cost: i === 0 ? day.sightCost || 0 : 0,
          sightType: day.sightType,
        }),
      )
    })
    if (day.breakfast) {
      items.push(
        row(`${id}-b${d}`, d, '09:00', 'meal', day.breakfast, {
          mealSlot: 'breakfast',
          place: day.breakfastPlace,
          cost: day.breakfastCost || 24000,
        }),
      )
    }
    items.push(
      row(`${id}-l${d}`, d, '12:30', 'meal', day.lunch, {
        mealSlot: 'lunch',
        place: day.lunchPlace,
        cost: day.lunchCost || 32000,
      }),
    )
    items.push(
      row(`${id}-d${d}`, d, '18:30', 'meal', day.dinner, {
        mealSlot: 'dinner',
        place: day.dinnerPlace,
        cost: day.dinnerCost || 48000,
      }),
    )
  }

  const last = days[nights] || days[days.length - 1]
  if (nights === 0 && last.transport) {
    items.push(
      row(`${id}-tr0`, 0, last.transportTime || '09:00', 'transport', last.transport, {
        transportMode: last.transportMode || 'subway',
        place: last.transportPlace || '',
        cost: last.transportCost || 6500,
        note: last.transportNote,
      }),
    )
  }
  const lastSights = last.sights || (last.sight ? [last.sight] : [])
  lastSights.forEach((sight, i) => {
    const sightTitle = typeof sight === 'string' ? sight : sight.title
    const sightPlace = typeof sight === 'string' ? last.sightPlace || '' : sight.place || last.sightPlace || ''
    items.push(
      row(`${id}-sL-${i}`, lastDay, `${String(9 + i * 2).padStart(2, '0')}:00`, 'sight', sightTitle, {
        place: sightPlace,
        cost: i === 0 ? last.sightCost || 0 : 0,
      }),
    )
  })
  if (last.breakfast) {
    items.push(
      row(`${id}-bL`, lastDay, '09:30', 'meal', last.breakfast, {
        mealSlot: 'breakfast',
        place: last.breakfastPlace,
        cost: last.breakfastCost || 28000,
      }),
    )
  }
  items.push(
    row(`${id}-lL`, lastDay, '12:00', 'meal', last.lunch, {
      mealSlot: 'lunch',
      place: last.lunchPlace,
      cost: last.lunchCost || 30000,
    }),
  )
  if (last.dinner) {
    items.push(
      row(`${id}-dL`, lastDay, '18:30', 'meal', last.dinner, {
        mealSlot: 'dinner',
        place: last.dinnerPlace,
        cost: last.dinnerCost || 42000,
      }),
    )
  }

  if (flightIn) {
    items.push(
      row(`${id}-tL`, lastDay, '15:00', 'transport', '렌터카 반납 · 공항', {
        transportMode: 'taxi',
        place: `시내 → ${airportName}`,
        cost: 0,
      }),
    )
    items.push(
      row(`${id}-fL`, lastDay, '17:20', 'flight', `${flightIn} ${place} → 김포`, {
        subtitle: airline,
        place: `${airport} 17:20 → GMP 18:30`,
        cost: 0,
        flight: {
          flightNo: flightIn,
          airline,
          destination: '서울 (GMP)',
          arriveTime: '18:30',
          arriveTerminal: '국내선',
        },
      }),
    )
  } else {
    items.push(
      row(`${id}-home`, lastDay, '16:00', 'transport', '자택/서울 복귀', {
        transportMode: 'taxi',
        place: '권역 → 서울',
        cost: 0,
      }),
    )
  }

  return {
    id,
    sort,
    nights,
    place,
    title,
    destination: place,
    market: 'kr',
    region,
    trip: {
      id: `sample-${id}`,
      title,
      destination: place,
      startDate: start,
      endDate: addDays(start, nights),
      adults: 2,
      children: 0,
      market: 'kr',
      items,
    },
  }
}

export const KR_SAMPLE_GROUPS = [
  { nights: 0, label: '당일' },
  { nights: 2, label: '2박 3일' },
]

/** 권역별 대표 스팟 — 한국관광100선 블로그(설나그네) 지역 리스트 참고 */
export const KR_REGION_META = [
  {
    id: 'kr-seoul',
    region: '서울',
    blogCount: 19,
    highlights: ['경복궁', '북촌한옥마을', 'N서울타워', '한강공원'],
    transportTip: '지하철·버스 · T-money·카카오T',
  },
  {
    id: 'kr-gangwon',
    region: '강원권',
    blogCount: 14,
    highlights: ['남이섬', '원대리 자작나무숲', '설악산', '속초관광수산시장'],
    transportTip: '자차/렌터카 · 주말 양양 고속도로 정체 주의',
  },
  {
    id: 'kr-chungcheong',
    region: '충청권',
    blogCount: 20,
    highlights: ['도담삼봉', '청남대', '공주 공산성', '부여 궁남지'],
    transportTip: 'KTX+렌터카 · 단양·공주 연계',
  },
  {
    id: 'kr-gyeonggi',
    region: '경기권',
    blogCount: 47,
    highlights: ['양평 두물머리', '아침고요수목원', '헤이리 예술마을', '수원화성'],
    transportTip: '외곽은 자차 · 수원·용인은 대중교통 가능',
  },
  {
    id: 'kr-gyeongsang',
    region: '경상권',
    blogCount: 43,
    highlights: ['경주 불국사·석굴암', '스페이스워크', '부산 해운대', '광안리'],
    transportTip: 'KTX 경주·부산 + 시내 택시/대중교통',
  },
  {
    id: 'kr-jeolla',
    region: '전라권',
    blogCount: 25,
    highlights: ['전주 한옥마을', '순천만국가정원', '순천만습지', '여수 밤바다'],
    transportTip: 'KTX 전주·순천·여수 + 카셰어링',
  },
  {
    id: 'kr-jeju',
    region: '제주권',
    blogCount: 6,
    highlights: ['성산일출봉', '우도', '비자림', '한라산'],
    transportTip: '항공 + 렌터카 필수',
  },
]

export const KR_SAMPLE_CATALOG = [
  buildKrSample({
    id: 'kr-seoul-day',
    sort: 0,
    nights: 0,
    place: '서울',
    region: '서울',
    title: '서울 고궁·한강 당일',
    hotel: '—',
    hotelPlace: '서울',
    nightly: 0,
    departNote: '서울 · 지하철·버스 (T-money)',
    days: [
      {
        sights: ['경복궁', '북촌한옥마을', 'N서울타워', '한강공원(여의도)'],
        sightPlace: '종로·용산·여의도',
        lunch: '광장시장 빈대떡·마약김밥',
        lunchPlace: '종로',
        dinner: '명동 갈비·냉면',
        dinnerPlace: '명동',
        sightCost: 3000,
        transport: '종로 → 남산 → 여의도',
        transportPlace: '서울 시내',
        transportCost: 6500,
        transportMode: 'subway',
        transportNote: '지하철 3·4호선 환승',
      },
    ],
  }),
  buildKrSample({
    id: 'kr-gangwon',
    sort: 1,
    nights: 2,
    place: '강원',
    region: '강원권',
    title: '강원 자연과 커피 2박3일',
    hotel: '속초 바다뷰 호텔',
    hotelPlace: '속초',
    nightly: 98000,
    departNote: '서울 · 자차/렌터카 (춘천 경유)',
    days: [
      {
        hotel: '속초 바다뷰 호텔',
        hotelPlace: '속초',
        nightly: 98000,
        sights: ['남이섬', '원대리 자작나무숲'],
        sightPlace: '춘천·인제',
        lunch: '춘천 닭갈비',
        lunchPlace: '춘천',
        dinner: '속초 아바이마을',
        dinnerPlace: '속초',
        sightCost: 12000,
        transport: '춘천 → 속초',
        transportPlace: '강원 동해안',
        transportCost: 42000,
        transportNote: '산간·해안 이동 — 자차 권장',
      },
      {
        hotel: '강릉 경포호 호텔',
        hotelPlace: '강릉',
        nightly: 105000,
        transport: '속초 → 강릉',
        transportPlace: '동해안',
        transportCost: 28000,
        sights: ['설악산 국립공원(권금성)', '경포호·경포해변'],
        sightPlace: '설악·강릉',
        lunch: '막국수',
        lunchPlace: '속초',
        dinner: '강릉 초당두부',
        dinnerPlace: '강릉',
        sightCost: 18000,
      },
      {
        sights: ['안목해변 커피거리', '정동진역·레일바이크'],
        sightPlace: '강릉·정동진',
        breakfast: '안목 브런치',
        breakfastPlace: '안목해변',
        lunch: '강릉 커피·빵',
        lunchPlace: '안목',
        sightCost: 22000,
      },
    ],
  }),
  buildKrSample({
    id: 'kr-chungcheong',
    sort: 2,
    nights: 2,
    place: '충청',
    region: '충청권',
    title: '충청 역사·호수 2박3일',
    hotel: '제천 의림지 호텔',
    hotelPlace: '제천',
    nightly: 88000,
    departNote: '서울 · 자차/KTX+렌터카',
    days: [
      {
        hotel: '제천 의림지 호텔',
        hotelPlace: '제천',
        sights: ['단양 도담삼봉', '단양강 잔도', '제천 의림지'],
        sightPlace: '단양·제천',
        lunch: '단양 떡갈비',
        lunchPlace: '단양',
        dinner: '약채락',
        dinnerPlace: '제천',
        sightCost: 15000,
      },
      {
        hotel: '공주 한옥스테이',
        hotelPlace: '공주',
        nightly: 92000,
        transport: '제천 → 청주 → 공주',
        transportPlace: '충북·충남',
        transportCost: 38000,
        sights: ['청남대', '공주 공산성'],
        sightPlace: '청주·공주',
        lunch: '청주 육개장',
        lunchPlace: '청주',
        dinner: '알밤막걸리·한정식',
        dinnerPlace: '공주',
        sightCost: 8000,
      },
      {
        sights: ['공주 무령왕릉·왕릉원', '부여 궁남지'],
        sightPlace: '공주·부여',
        lunch: '부여 eel/민물매운탕',
        lunchPlace: '부여',
        sightCost: 12000,
      },
    ],
  }),
  buildKrSample({
    id: 'kr-gyeonggi',
    sort: 3,
    nights: 2,
    place: '경기',
    region: '경기권',
    title: '경기 2박3일 · 카페·힐링',
    hotel: '가평 펜션',
    hotelPlace: '가평',
    nightly: 85000,
    departNote: '서울 · 자차 (외곽 자연권)',
    days: [
      {
        hotel: '포천 호텔',
        hotelPlace: '포천',
        nightly: 90000,
        sights: ['양평 두물머리', '아침고요수목원', '포천 아트밸리(천주호)'],
        sightPlace: '양평·가평·포천',
        lunch: '연핫도그·두물머리',
        lunchPlace: '양평',
        dinner: '포천 이동갈비',
        dinnerPlace: '포천',
        sightCost: 22000,
      },
      {
        hotel: '용인 리조트',
        hotelPlace: '용인',
        nightly: 110000,
        transport: '포천 → 파주 → 용인',
        transportPlace: '경기 북부·남부',
        transportCost: 45000,
        sights: ['파주 임진각', '헤이리 예술마을', '한국민속촌(야간)'],
        sightPlace: '파주·용인',
        lunch: '파주 통일빵',
        lunchPlace: '파주',
        dinner: '민속촌 야간',
        dinnerPlace: '용인',
        sightCost: 28000,
      },
      {
        sights: ['수원 화성 성곽길', '행궁동·행리단길'],
        sightPlace: '수원',
        lunch: '행궁동 카페·브런치',
        lunchPlace: '수원',
        sightCost: 0,
      },
    ],
  }),
  buildKrSample({
    id: 'kr-gyeongsang',
    sort: 4,
    nights: 2,
    place: '경상',
    region: '경상권',
    title: '경상 고도와 바다 2박3일',
    hotel: '경주 한옥스테이',
    hotelPlace: '경주',
    nightly: 95000,
    departNote: '서울역 · KTX 경주 (또는 자차)',
    days: [
      {
        hotel: '경주 한옥스테이',
        hotelPlace: '경주',
        sights: ['경주 불국사·석굴암', '대릉원·황리단길', '동궁과 월지(안압지)'],
        sightPlace: '경주',
        lunch: '경주 한정식',
        lunchPlace: '경주',
        dinner: '황리단길',
        dinnerPlace: '경주',
        sightCost: 24000,
      },
      {
        hotel: '부산 해운대 호텔',
        hotelPlace: '부산',
        nightly: 125000,
        transport: '경주 → 포항 → 부산',
        transportPlace: '경북·부산',
        transportCost: 52000,
        sights: ['호미곶 일출', '스페이스워크', '해운대·더베이101'],
        sightPlace: '포항·부산',
        lunch: '포항 과메기',
        lunchPlace: '포항',
        dinner: '해운대 야경',
        dinnerPlace: '부산',
        sightCost: 8000,
      },
      {
        sights: ['청사포 스카이캡슐', '광안리 해변'],
        sightPlace: '부산',
        breakfast: '광안리 브런치',
        breakfastPlace: '광안리',
        lunch: '돼지국밥',
        lunchPlace: '부산',
        sightCost: 15000,
      },
    ],
  }),
  buildKrSample({
    id: 'kr-jeolla',
    sort: 5,
    nights: 2,
    place: '전라',
    region: '전라권',
    title: '전라 미식·생태 2박3일',
    hotel: '전주 한옥스테이',
    hotelPlace: '전주',
    nightly: 90000,
    departNote: '용산역 · KTX 전주',
    days: [
      {
        hotel: '담양 펜션',
        hotelPlace: '담양',
        nightly: 82000,
        transport: '전주 → 담양',
        transportPlace: '전북',
        transportCost: 28000,
        sights: ['전주 한옥마을', '담양 죽녹원·메타세쿼이아길'],
        sightPlace: '전주·담양',
        lunch: '전주 비빔밥·가맥',
        lunchPlace: '전주',
        dinner: '담양 떡갈비',
        dinnerPlace: '담양',
        sightCost: 10000,
      },
      {
        hotel: '여수 바다뷰 호텔',
        hotelPlace: '여수',
        nightly: 108000,
        transport: '담양 → 순천 → 여수',
        transportPlace: '전남',
        transportCost: 48000,
        sights: ['순천만국가정원', '순천만습지(낙조)'],
        sightPlace: '순천',
        lunch: '순천 떡갈비',
        lunchPlace: '순천',
        dinner: '여수 밤바다·낭만포차',
        dinnerPlace: '여수',
        sightCost: 18000,
      },
      {
        sights: ['여수 오동도', '여수 해상케이블카'],
        sightPlace: '여수',
        lunch: '갓김치·회',
        lunchPlace: '여수',
        sightCost: 22000,
      },
    ],
  }),
  buildKrSample({
    id: 'kr-jeju',
    sort: 6,
    nights: 2,
    place: '제주',
    region: '제주권',
    title: '제주 바다와 오름 2박3일',
    hotel: '서귀포 리조트',
    hotelPlace: '서귀포',
    nightly: 115000,
    airline: '제주항공',
    flightOut: '7C101',
    flightIn: '7C102',
    airport: 'CJU',
    airportName: '제주국제공항',
    days: [
      {
        hotel: '서귀포 리조트',
        hotelPlace: '서귀포',
        sights: ['협재·금능해수욕장', '산방산·용머리해안'],
        sightPlace: '서귀포',
        lunch: '고기국수',
        lunchPlace: '협재',
        dinner: '흑돼지',
        dinnerPlace: '서귀포',
        sightCost: 8000,
      },
      {
        hotel: '성산 펜션',
        hotelPlace: '성산',
        nightly: 98000,
        transport: '서귀포 → 동부',
        transportPlace: '제주',
        transportCost: 35000,
        sights: ['천지연폭포', '비자림', '섭지코지'],
        sightPlace: '서귀포·성산',
        lunch: '갈치조림',
        lunchPlace: '서귀포',
        dinner: '성산 해물',
        dinnerPlace: '성산',
        sightCost: 14000,
      },
      {
        sights: ['성산일출봉', '우도', '동문시장'],
        sightPlace: '성산·제주시',
        lunch: '동문시장 간식',
        lunchPlace: '제주시',
        sightCost: 20000,
      },
    ],
  }),
]
