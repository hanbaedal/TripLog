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

function buildSample({
  id,
  sort,
  nights,
  place,
  title,
  airport,
  airportName,
  airline,
  flightOut,
  flightIn,
  hotel,
  hotelPlace,
  nightly,
  days,
}) {
  const start = '2026-09-15'
  const items = []
  const lastDay = nights

  items.push(
    row(`${id}-f0`, 0, '08:20', 'flight', `${flightOut} 인천 → ${place}`, {
      subtitle: airline,
      place: `ICN 08:20 → ${airport} 09:50`,
      cost: 360000 + nights * 18000,
      flight: {
        flightNo: flightOut,
        airline,
        destination: `${place} (${airport})`,
        arriveTime: '09:50',
        departTerminal: 'T1',
      },
    }),
  )
  items.push(
    row(`${id}-t0`, 0, '10:20', 'transport', '공항 리무진', {
      transportMode: 'bus',
      place: `${airportName} → 시내`,
      cost: 16000,
    }),
  )

  for (let d = 0; d < nights; d++) {
    const day = days[d] || days[days.length - 1]
    const stayName = day.hotel || hotel
    const stayPlace = day.hotelPlace || hotelPlace
    const stayCost = day.nightly ?? nightly
    items.push(
      row(`${id}-h${d}`, d, d === 0 ? '15:00' : '12:00', 'hotel', stayName, {
        place: stayPlace,
        cost: stayCost,
      }),
    )
    if (day.transport) {
      items.push(
        row(`${id}-tr${d}`, d, day.transportTime || '08:30', 'transport', day.transport, {
          transportMode: day.transportMode || 'train',
          place: day.transportPlace || '',
          cost: day.transportCost || 24000,
        }),
      )
    }
    const sights = day.sights || (day.sight ? [day.sight] : [])
    sights.forEach((sight, i) => {
      const title = typeof sight === 'string' ? sight : sight.title
      const sightPlace = typeof sight === 'string' ? day.sightPlace || '' : sight.place || day.sightPlace || ''
      const hour = 9 + i * 2
      const minute = 10 + (i % 3) * 15
      items.push(
        row(`${id}-s${d}-${i}`, d, `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, 'sight', title, {
          place: sightPlace,
          cost: i === 0 ? day.sightCost || 0 : 0,
        }),
      )
    })
    items.push(
      row(`${id}-l${d}`, d, d === 0 ? '12:30' : '12:10', 'meal', day.lunch, {
        mealSlot: 'lunch',
        place: day.lunchPlace,
        cost: 28000,
      }),
    )
    items.push(
      row(`${id}-d${d}`, d, '18:40', 'meal', day.dinner, {
        mealSlot: 'dinner',
        place: day.dinnerPlace,
        cost: 52000,
      }),
    )
  }

  const last = days[nights] || days[days.length - 1]
  const lastSights = last.sights || (last.sight ? [last.sight] : [])
  lastSights.forEach((sight, i) => {
    const title = typeof sight === 'string' ? sight : sight.title
    const sightPlace = typeof sight === 'string' ? last.sightPlace || '' : sight.place || last.sightPlace || ''
    const hour = 9 + i * 2
    const minute = 10 + (i % 3) * 15
    items.push(
      row(`${id}-sL-${i}`, lastDay, `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, 'sight', title, {
        place: sightPlace,
        cost: i === 0 ? last.sightCost || 0 : 0,
      }),
    )
  })
  items.push(
    row(`${id}-lL`, lastDay, '12:00', 'meal', last.lunch, {
      mealSlot: 'lunch',
      place: last.lunchPlace,
      cost: 26000,
    }),
  )
  items.push(
    row(`${id}-tL`, lastDay, '15:20', 'transport', '공항 리무진', {
      transportMode: 'bus',
      place: `시내 → ${airportName}`,
      cost: 16000,
    }),
  )
  items.push(
    row(`${id}-fL`, lastDay, '17:50', 'flight', `${flightIn} ${place} → 인천`, {
      subtitle: airline,
      place: `${airport} 17:50 → ICN 20:20`,
      cost: 0,
      flight: {
        flightNo: flightIn,
        airline,
        destination: '서울 (ICN)',
        arriveTime: '20:20',
        arriveTerminal: 'T1',
      },
    }),
  )

  return {
    id,
    sort,
    nights,
    place,
    title,
    destination: place,
    trip: {
      id: `sample-${id}`,
      title,
      destination: place,
      startDate: start,
      endDate: addDays(start, nights),
      adults: 2,
      children: 0,
      items,
    },
  }
}

export const SAMPLE_CATALOG = [
  buildSample({
    id: 'dalian',
    sort: 1,
    nights: 3,
    place: '大连市',
    title: '大连市 3박4일',
    airport: 'DLC',
    airportName: '大连周水子国际机场',
    airline: '대한항공',
    flightOut: 'KE867',
    flightIn: 'KE868',
    hotel: '大连富丽华酒店',
    hotelPlace: '中山区人民路',
    nightly: 120000,
    days: [
      {
        sights: ['星海广场', '莲花山', '俄罗斯风情街', '中山广场'],
        lunch: '海鲜小炒', lunchPlace: '星海广场', dinner: '东北菜', dinnerPlace: '中山广场',
      },
      {
        sights: ['旅顺日俄监狱旧址博物馆', '东港音乐喷泉广场', '东方水城'],
        lunch: '海鲜饺子', lunchPlace: '东港', dinner: '海鲜火锅', dinnerPlace: '东港', sightCost: 18000,
      },
      {
        sights: ['金石滩', '金石园', '滨海国家地质公园', '西安路'],
        lunch: '海鲜面', lunchPlace: '金石滩', dinner: '烧烤', dinnerPlace: '西安路', sightCost: 22000,
      },
      {
        sights: ['劳动公园', '大菜市水产品批发大市场'],
        lunch: '机场简餐', lunchPlace: '周水子',
      },
    ],
  }),
  buildSample({
    id: 'yantai',
    sort: 2,
    nights: 3,
    place: '烟台市',
    title: '烟台市 3박4일',
    airport: 'YNT',
    airportName: '烟台蓬莱国际机场',
    airline: '아시아나항공',
    flightOut: 'OZ323',
    flightIn: 'OZ324',
    hotel: '烟台万豪酒店',
    hotelPlace: '莱山区滨海路',
    nightly: 110000,
    days: [
      {
        sights: ['渔人码头', '月亮湾', '烟台山', '朝阳街', '所城里'],
        lunch: '海鲜烧烤', lunchPlace: '渔人码头', dinner: '鲁菜', dinnerPlace: '所城里',
      },
      {
        sights: ['养马岛', '烟台自然博物馆'],
        lunch: '海鲜面', lunchPlace: '养马岛', dinner: '小笼包', dinnerPlace: '市区', sightCost: 20000,
      },
      {
        sights: ['蓬莱阁景区'],
        lunch: '蓬莱海鲜', lunchPlace: '蓬莱阁', dinner: '海鲜宴', dinnerPlace: '蓬莱', sightCost: 22000,
      },
      {
        sights: ['凤凰山公园'],
        lunch: '简餐', lunchPlace: '市区',
      },
    ],
  }),
  buildSample({
    id: 'qingdao',
    sort: 3,
    nights: 3,
    place: '青岛市',
    title: '青岛市 3박4일',
    airport: 'TAO',
    airportName: '青岛胶东国际机场',
    airline: '산둥항공',
    flightOut: 'SC4612',
    flightIn: 'SC4611',
    hotel: '青岛海天大酒店',
    hotelPlace: '市南区栈桥',
    nightly: 130000,
    days: [
      {
        sights: ['即墨路小商品市场', '劈柴院'],
        lunch: '青岛大虾面', lunchPlace: '劈柴院', dinner: '海鲜大排档', dinnerPlace: '中山路',
      },
      {
        sights: ['崂山风景区'],
        lunch: '道家素斋', lunchPlace: '太清宫', dinner: '啤酒街小食', dinnerPlace: '登州路', sightCost: 35000,
      },
      {
        sights: ['五四广场', '奥帆海洋文化旅游区', '八大关风景区', '青岛啤酒博物馆'],
        lunch: '海鲜饺子', lunchPlace: '八大关', dinner: '青岛啤酒套餐', dinnerPlace: '啤酒博物馆', sightCost: 15000,
      },
      {
        sights: ['小鱼山景区', '小青岛景区', '栈桥景区'],
        lunch: '简餐', lunchPlace: '栈桥',
      },
    ],
  }),
  buildSample({
    id: 'harbin',
    sort: 4,
    nights: 3,
    place: '哈尔滨市',
    title: '哈尔滨市 3박4일',
    airport: 'HRB',
    airportName: '哈尔滨太平国际机场',
    airline: '중국남방항공',
    flightOut: 'CZ316',
    flightIn: 'CZ315',
    hotel: '哈尔滨香格里拉',
    hotelPlace: '道里区中央大街',
    nightly: 125000,
    days: [
      {
        sights: ['安重根义士纪念馆', '圣索菲亚教堂', '中央大街', '胜利纪念塔'],
        lunch: '红肠简餐', lunchPlace: '中央大街', dinner: '东北炖菜', dinnerPlace: '中央大街',
      },
      {
        sights: ['太阳岛', '黑龙江省博物馆'],
        lunch: '江鱼饺子', lunchPlace: '太阳岛', dinner: '俄式西餐', dinnerPlace: '中央大街', sightCost: 15000,
      },
      {
        sights: ['第七三一部队遗址', '龙塔'],
        lunch: '东北菜', lunchPlace: '南岗', dinner: '火锅', dinnerPlace: '果戈里大街', sightCost: 12000,
      },
      {
        sights: ['东北虎林园'],
        lunch: '简餐', lunchPlace: '机场方向',
      },
    ],
  }),
  buildSample({
    id: 'beijing',
    sort: 5,
    nights: 4,
    place: '북경',
    title: '북경 고궁과 장성 닷새',
    airport: 'PEK',
    airportName: '베이징 서우두',
    airline: '중국국제항공',
    flightOut: 'CA126',
    flightIn: 'CA125',
    hotel: '왕푸징 펜인슐라',
    hotelPlace: '동청구 왕푸징',
    nightly: 180000,
    days: [
      { sight: '자금성', sightPlace: '동청구', lunch: '북경 카오야', lunchPlace: '첸먼', dinner: '후통 사합원 요리', dinnerPlace: '난뤄구샹', sightCost: 12000 },
      { sight: '만리장성 무티엔위', sightPlace: '화이러우', lunch: '농가채', lunchPlace: '장성 입구', dinner: '카오야', dinnerPlace: '허핑먼', sightCost: 45000 },
      { sight: '이화원', sightPlace: '하이뎬', lunch: '소채 만두', lunchPlace: '이화원', dinner: '싼리툰 요리', dinnerPlace: '차오양', sightCost: 15000 },
      { sight: '798 예술구', sightPlace: '차오양', lunch: '카페 브런치', lunchPlace: '798', dinner: '북경 요리', dinnerPlace: '왕푸징' },
      { sight: '천안문 광장', sightPlace: '동청구', lunch: '간단 면', lunchPlace: '첸먼' },
    ],
  }),
  buildSample({
    id: 'shanghai',
    sort: 6,
    nights: 4,
    place: '상하이',
    title: '상하이 외탄 닷새',
    airport: 'PVG',
    airportName: '상하이 푸동',
    airline: '중국동방항공',
    flightOut: 'MU5032',
    flightIn: 'MU5031',
    hotel: '진장 메트로폴로',
    hotelPlace: '황푸구 난징둥루',
    nightly: 200000,
    days: [
      { sight: '외탄', sightPlace: '황푸강', lunch: '샤오롱바오', lunchPlace: '위위안', dinner: '본방요리', dinnerPlace: '신톈디' },
      { sight: '위위안 · 청황묘', sightPlace: '황푸구', lunch: '난샹 만두', lunchPlace: '위위안', dinner: '와이탄 뷰 디너', dinnerPlace: '와이탄', sightCost: 8000 },
      { sight: '티엔쯔팡', sightPlace: '황푸구', lunch: '창러로 브런치', lunchPlace: '창러로', dinner: '본방 코스', dinnerPlace: '신톈디' },
      { sight: '동방명주 · 루자쭈이', sightPlace: '푸동', lunch: '푸동 국수', lunchPlace: '루자쭈이', dinner: '난징시루 요리', dinnerPlace: '징안', sightCost: 22000 },
      { sight: '난징루 산책', sightPlace: '황푸구', lunch: '간단 만두', lunchPlace: '난징루' },
    ],
  }),
  buildSample({
    id: 'hongkong',
    sort: 7,
    nights: 4,
    place: '홍콩',
    title: '홍콩 빅토리아 닷새',
    airport: 'HKG',
    airportName: '홍콩 국제공항',
    airline: '캐세이퍼시픽항공',
    flightOut: 'CX411',
    flightIn: 'CX410',
    hotel: '침사추이 하버뷰',
    hotelPlace: '주룽 침사추이',
    nightly: 280000,
    days: [
      { sight: '침사추이 해안', sightPlace: '주룽', lunch: '딤섬', lunchPlace: '팀호완', dinner: '완차이 해산물', dinnerPlace: '완차이' },
      { sight: '빅토리아피크', sightPlace: '홍콩섬', lunch: '피크 카페', lunchPlace: '피크', dinner: '란콰이퐁', dinnerPlace: '중환', sightCost: 18000 },
      { sight: '스탠리 · 리펄스베이', sightPlace: '남구', lunch: '해변 브런치', lunchPlace: '리펄스베이', dinner: '심샤추이 시추안', dinnerPlace: '주룽' },
      { sight: '템플스트리트', sightPlace: '야우마테이', lunch: '차찬텡', lunchPlace: '몽콕', dinner: '해산물 모둠', dinnerPlace: '레이위에문' },
      { sight: '스타페리', sightPlace: '빅토리아 하버', lunch: '공항 딤섬', lunchPlace: '공항' },
    ],
  }),
  buildSample({
    id: 'baekdusan',
    sort: 8,
    nights: 4,
    place: '백두산',
    title: '백두산 천지 닷새',
    airport: 'YNJ',
    airportName: '옌지 차오양촨',
    airline: '중국남방항공',
    flightOut: 'CZ368',
    flightIn: 'CZ367',
    hotel: '이도백하 온천호텔',
    hotelPlace: '안투현 이도백하',
    nightly: 140000,
    days: [
      {
        hotel: '옌지 국제호텔',
        hotelPlace: '옌지시 허난가',
        nightly: 110000,
        sight: '옌지 모아산',
        sightPlace: '옌지',
        lunch: '냉면',
        lunchPlace: '옌지 시장',
        dinner: '조선족 모둠',
        dinnerPlace: '옌지',
      },
      {
        transport: '이도백하 이동',
        transportMode: 'bus',
        transportPlace: '옌지 → 이도백하',
        transportCost: 28000,
        sight: '백두산 천지',
        sightPlace: '북파',
        lunch: '온천 단지 식사',
        lunchPlace: '북파',
        dinner: '온천호텔 석식',
        dinnerPlace: '이도백하',
        sightCost: 85000,
      },
      { sight: '창바이 폭포 · 온천', sightPlace: '북파', lunch: '산채 정식', lunchPlace: '경구', dinner: '약선 요리', dinnerPlace: '호텔', sightCost: 0 },
      { sight: '한커우 숲', sightPlace: '이도백하', lunch: '산채', lunchPlace: '마을', dinner: '옌지 냉면', dinnerPlace: '옌지' },
      { sight: '옌지 민속원', sightPlace: '옌지', lunch: '간단 냉면', lunchPlace: '시내' },
    ],
  }),
  buildSample({
    id: 'xian',
    sort: 9,
    nights: 4,
    place: '서안',
    title: '서안 병마용 닷새',
    airport: 'XIY',
    airportName: '시안 셴양',
    airline: '중국동방항공',
    flightOut: 'MU2103',
    flightIn: 'MU2104',
    hotel: '시안 성리 호텔',
    hotelPlace: '베이린구 동대가',
    nightly: 140000,
    days: [
      { sight: '종루 · 회민가', sightPlace: '베이린구', lunch: '양육파', lunchPlace: '회민가', dinner: '산시 요리', dinnerPlace: '동대가' },
      { sight: '병마용', sightPlace: '임동구', lunch: '임동 국수', lunchPlace: '병마용', dinner: '수타면', dinnerPlace: '성내', sightCost: 35000 },
      { sight: '화청지', sightPlace: '임동구', lunch: '산시 모둠', lunchPlace: '화청지', dinner: '훠궈', dinnerPlace: '가오신', sightCost: 22000 },
      { sight: '시안 성벽', sightPlace: '베이린구', lunch: '육협모', lunchPlace: '성내', dinner: '대당불야성', dinnerPlace: '옌타구', sightCost: 15000 },
      { sight: '대안탑', sightPlace: '옌타구', lunch: '간단 면', lunchPlace: '옌타', sightCost: 8000 },
    ],
  }),
  buildSample({
    id: 'chengdu',
    sort: 10,
    nights: 5,
    place: '청두',
    title: '청두 판다와 골목 엿새',
    airport: 'TFU',
    airportName: '청두 톈푸',
    airline: '쓰촨항공',
    flightOut: '3U3912',
    flightIn: '3U3911',
    hotel: '청두 니하오 호텔',
    hotelPlace: '칭양구 쿠안자이샹즈',
    nightly: 150000,
    days: [
      { sight: '쿠안자이샹즈', sightPlace: '칭양구', lunch: '단단면', lunchPlace: '총리', dinner: '훠궈', dinnerPlace: '춘시로' },
      { sight: '청두 판다기지', sightPlace: '청화구', lunch: '기지 근처 면', lunchPlace: '판다기지', dinner: '마파두부 정식', dinnerPlace: '진리', sightCost: 22000 },
      { sight: '진리 · 무후사', sightPlace: '우허우구', lunch: '중식 덮밥', lunchPlace: '진리', dinner: '청두 훠궈', dinnerPlace: '주자차오', sightCost: 8000 },
      { sight: '두푸초당', sightPlace: '칭양구', lunch: '소채', lunchPlace: '초당', dinner: '관리골목 안주', dinnerPlace: '쿠안자이', sightCost: 10000 },
      { sight: '낙산대불 당일', sightPlace: '러산', lunch: '러산 두부', lunchPlace: '러산', dinner: '청두 훠궈', dinnerPlace: '시내', sightCost: 65000, transport: '러산 기차', transportPlace: '청두 → 러산', transportCost: 32000 },
      { sight: '인민공원 찻집', sightPlace: '칭양구', lunch: '간단 면', lunchPlace: '시내' },
    ],
  }),
  buildSample({
    id: 'taihang',
    sort: 11,
    nights: 5,
    place: '태항산',
    title: '태항대협곡 엿새',
    airport: 'CGO',
    airportName: '정저우 신정',
    airline: '중국남방항공',
    flightOut: 'CZ350',
    flightIn: 'CZ349',
    hotel: '린저우 태항 산장',
    hotelPlace: '린저우시 태항대협곡',
    nightly: 100000,
    days: [
      {
        hotel: '정저우 야트 호텔',
        hotelPlace: '얼치구',
        nightly: 115000,
        sight: '정저우 얼치광장',
        sightPlace: '정저우',
        lunch: '정저우 국수',
        lunchPlace: '정저우',
        dinner: '위차이',
        dinnerPlace: '정동신구',
      },
      {
        transport: '린저우 버스',
        transportMode: 'bus',
        transportPlace: '정저우 → 린저우',
        transportCost: 35000,
        sight: '태항대협곡',
        sightPlace: '린저우',
        lunch: '산채',
        lunchPlace: '협곡',
        dinner: '산장 석식',
        dinnerPlace: '린저우',
        sightCost: 42000,
      },
      { sight: '왕상옌', sightPlace: '린저우', lunch: '산채 정식', lunchPlace: '왕상옌', dinner: '약선', dinnerPlace: '산장', sightCost: 38000 },
      { sight: '훙치취', sightPlace: '린저우', lunch: '농가채', lunchPlace: '훙치취', dinner: '산장 석식', dinnerPlace: '린저우', sightCost: 20000 },
      { sight: '구련산', sightPlace: '후이현', lunch: '산채', lunchPlace: '구련산', dinner: '정저우 위차이', dinnerPlace: '정저우', sightCost: 28000 },
      { sight: '허난박물관', sightPlace: '정저우', lunch: '간단 면', lunchPlace: '시내' },
    ],
  }),
  buildSample({
    id: 'huangshan',
    sort: 12,
    nights: 5,
    place: '황산',
    title: '황산 운해 엿새',
    airport: 'TXN',
    airportName: '황산 툰시',
    airline: '중국동방항공',
    flightOut: 'MU2096',
    flightIn: 'MU2095',
    hotel: '황산 북해호텔',
    hotelPlace: '황산 경구 북해',
    nightly: 160000,
    days: [
      {
        hotel: '툰시 라오제 호텔',
        hotelPlace: '툰시구',
        nightly: 120000,
        sight: '툰시 라오제',
        sightPlace: '황산시',
        lunch: '휘차이',
        lunchPlace: '라오제',
        dinner: '휘차이',
        dinnerPlace: '툰시',
      },
      {
        transport: '경구 케이블',
        transportMode: 'other',
        transportPlace: '툰시 → 운곡사',
        transportCost: 28000,
        sight: '운곡사 · 시해대협곡',
        sightPlace: '황산 경구',
        lunch: '경구 도시락',
        lunchPlace: '산상',
        dinner: '북해호텔 석식',
        dinnerPlace: '북해',
        sightCost: 95000,
      },
      { sight: '연화봉 · 영빈루', sightPlace: '황산', lunch: '산상 면', lunchPlace: '백아령', dinner: '호텔 석식', dinnerPlace: '북해' },
      { sight: '시해대협곡 하산', sightPlace: '황산', lunch: '탕커우 휘차이', lunchPlace: '탕커우', dinner: '훙춘 근처', dinnerPlace: '이현' },
      { sight: '훙춘 · 시디', sightPlace: '이현', lunch: '휘차이', lunchPlace: '훙춘', dinner: '툰시 석식', dinnerPlace: '라오제', sightCost: 32000 },
      { sight: '툰시 산책', sightPlace: '툰시', lunch: '간단 면', lunchPlace: '라오제' },
    ],
  }),
  buildSample({
    id: 'zhangjiajie',
    sort: 13,
    nights: 5,
    place: '장가계',
    title: '장가계 아바타 산 엿새',
    airport: 'DYG',
    airportName: '장가계 허화',
    airline: '춘추항공',
    flightOut: '9C8612',
    flightIn: '9C8611',
    hotel: '무가계 산장호텔',
    hotelPlace: '우링위안구',
    nightly: 145000,
    days: [
      { sight: '천문산', sightPlace: '융딩구', lunch: '산채', lunchPlace: '천문산', dinner: '투자족 요리', dinnerPlace: '시내', sightCost: 78000 },
      { sight: '원가계 · 아바타 산', sightPlace: '우링위안', lunch: '경구 도시락', lunchPlace: '원가계', dinner: '산장 석식', dinnerPlace: '무가계', sightCost: 85000 },
      { sight: '금편계', sightPlace: '우링위안', lunch: '산채', lunchPlace: '금편계', dinner: '투자 모둠', dinnerPlace: '무가계', sightCost: 0 },
      { sight: '유리잔도 · 백룡엘리베이터', sightPlace: '우링위안', lunch: '경구 면', lunchPlace: '양좌잔도', dinner: '시내 석식', dinnerPlace: '융딩', sightCost: 30000 },
      { sight: '보봉호', sightPlace: '우링위안', lunch: '호수 근처', lunchPlace: '보봉', dinner: '투자족', dinnerPlace: '무가계', sightCost: 18000 },
      { sight: '시내 산책', sightPlace: '융딩', lunch: '간단 면', lunchPlace: '시내' },
    ],
  }),
  buildSample({
    id: 'yunnan',
    sort: 14,
    nights: 6,
    place: '운남',
    title: '운남 쿤밍 다리 리장 이레',
    airport: 'KMG',
    airportName: '쿤밍 창수이',
    airline: '중국동방항공',
    flightOut: 'MU5702',
    flightIn: 'MU5701',
    hotel: '쿤밍 그린레이크 호텔',
    hotelPlace: '우화구 취후',
    nightly: 130000,
    days: [
      { sight: '석림', sightPlace: '스린이족자치현', lunch: '이족 산채', lunchPlace: '석림', dinner: '윈난 과교미선', dinnerPlace: '쿤밍', sightCost: 28000 },
      { sight: '취후 · 윈난대학', sightPlace: '쿤밍', lunch: '치즈 에리쓰', lunchPlace: '취후', dinner: '버섯 훠궈', dinnerPlace: '쿤밍' },
      {
        hotel: '다리 고대성 객잔',
        hotelPlace: '다리시 고대성',
        nightly: 125000,
        transport: '다리 기차',
        transportPlace: '쿤밍 → 다리',
        transportCost: 42000,
        sight: '다리 고대성',
        sightPlace: '다리',
        lunch: '바이족 삼도차',
        lunchPlace: '고대성',
        dinner: '생선 요리',
        dinnerPlace: '얼하이',
      },
      { hotel: '다리 고대성 객잔', hotelPlace: '다리시 고대성', nightly: 125000, sight: '얼하이 자전거', sightPlace: '차이춘', lunch: '호숫가', lunchPlace: '얼하이', dinner: '고대성 석식', dinnerPlace: '다리', sightCost: 12000 },
      {
        hotel: '리장 고성 객잔',
        hotelPlace: '구청구',
        nightly: 140000,
        transport: '리장 버스',
        transportPlace: '다리 → 리장',
        transportCost: 38000,
        sight: '리장 고성',
        sightPlace: '리장',
        lunch: '나시족 요리',
        lunchPlace: '고성',
        dinner: '고성 야시장',
        dinnerPlace: '리장',
      },
      { hotel: '리장 고성 객잔', hotelPlace: '구청구', nightly: 140000, sight: '옥룡설산', sightPlace: '간하이쯔', lunch: '산채', lunchPlace: '설산', dinner: '고성 석식', dinnerPlace: '리장', sightCost: 72000 },
      { sight: '흑룡담', sightPlace: '리장', lunch: '간단 면', lunchPlace: '고성' },
    ],
  }),
  buildSample({
    id: 'guizhou',
    sort: 15,
    nights: 6,
    place: '귀주',
    title: '귀주 황과수 이레',
    airport: 'KWE',
    airportName: '구이양 롱동바오',
    airline: '중국남방항공',
    flightOut: 'CZ3472',
    flightIn: 'CZ3471',
    hotel: '구이양 쉐라톤',
    hotelPlace: '난밍구',
    nightly: 120000,
    days: [
      { sight: '자자관 · 난밍허', sightPlace: '구이양', lunch: '산차이', lunchPlace: '구이양', dinner: '산라펀', dinnerPlace: '첸춘로' },
      { sight: '칭옌고진', sightPlace: '화시구', lunch: '고진 두부', lunchPlace: '칭옌', dinner: '산라펀', dinnerPlace: '구이양', sightCost: 18000 },
      {
        hotel: '황과수 경구 호텔',
        hotelPlace: '안순 전닝',
        nightly: 110000,
        transport: '황과수 버스',
        transportPlace: '구이양 → 황과수',
        transportCost: 30000,
        sight: '황과수 대폭포',
        sightPlace: '전닝',
        lunch: '경구 산채',
        lunchPlace: '폭포',
        dinner: '호텔 석식',
        dinnerPlace: '황과수',
        sightCost: 48000,
      },
      { hotel: '황과수 경구 호텔', hotelPlace: '안순 전닝', nightly: 110000, sight: '톈싱차오 · 두우탄', sightPlace: '황과수', lunch: '산채', lunchPlace: '경구', dinner: '묘족 요리', dinnerPlace: '전닝', sightCost: 0 },
      {
        hotel: '구이양 쉐라톤',
        hotelPlace: '난밍구',
        nightly: 120000,
        transport: '구이양 복귀',
        transportPlace: '황과수 → 구이양',
        transportCost: 30000,
        sight: '첸링공원',
        sightPlace: '구이양',
        lunch: '산차이',
        lunchPlace: '구이양',
        dinner: '샤오치콩 전 야시장',
        dinnerPlace: '구이양',
      },
      { sight: '샤오치콩', sightPlace: '리보', lunch: '산채', lunchPlace: '리보', dinner: '구이양 석식', dinnerPlace: '난밍', sightCost: 36000 },
      { sight: '자자관 산책', sightPlace: '구이양', lunch: '간단 면', lunchPlace: '시내' },
    ],
  }),
]

export const SAMPLE_GROUPS = [
  { nights: 3, label: '3박 4일' },
  { nights: 4, label: '4박 5일' },
  { nights: 5, label: '5박 6일' },
  { nights: 6, label: '6박 7일' },
]
