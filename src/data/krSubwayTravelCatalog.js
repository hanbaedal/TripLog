/** 수도권 지하철 노선별 관광지 — 서울·인천·경기 */

import { KR_GALLERY_PHOTOS } from './krGalleryCatalog.js'

function gallerySrc(photoId) {
  return KR_GALLERY_PHOTOS.find((row) => row.id === photoId)?.src || ''
}

export const SUBWAY_LINES = [
  { id: 'line-1', label: '1호선', region: 'seoul', color: '#0052A4', sort: 1 },
  { id: 'line-2', label: '2호선', region: 'seoul', color: '#00A84D', sort: 2 },
  { id: 'line-3', label: '3호선', region: 'seoul', color: '#EF7C1C', sort: 3 },
  { id: 'line-4', label: '4호선', region: 'seoul', color: '#00A5DE', sort: 4 },
  { id: 'line-5', label: '5호선', region: 'seoul', color: '#996CAC', sort: 5 },
  { id: 'line-6', label: '6호선', region: 'seoul', color: '#CD7C2F', sort: 6 },
  { id: 'line-7', label: '7호선', region: 'seoul', color: '#747F00', sort: 7 },
  { id: 'line-8', label: '8호선', region: 'seoul', color: '#E6186C', sort: 8 },
  { id: 'line-9', label: '9호선', region: 'seoul', color: '#BDB092', sort: 9 },
  { id: 'line-airport', label: '공항철도', region: 'seoul', color: '#0090D2', sort: 10 },
  { id: 'line-gyeongui', label: '경의·중앙', region: 'gyeonggi', color: '#77C4A3', sort: 11 },
  { id: 'line-bundang', label: '수인분당', region: 'gyeonggi', color: '#FABE00', sort: 12 },
  { id: 'line-shinbundang', label: '신분당', region: 'seoul', color: '#D31145', sort: 13 },
  { id: 'line-incheon-1', label: '인천1호선', region: 'incheon', color: '#7CA8D5', sort: 20 },
  { id: 'line-incheon-2', label: '인천2호선', region: 'incheon', color: '#ED8B00', sort: 21 },
]

export const KR_SUBWAY_TRAVEL_INFO = {
  id: 'info-kr-subway',
  market: 'kr',
  place: '전철타고',
  title: '전철타고 (서울·인천·경기)',
  body: '수도권 지하철 노선별 역 주변 관광지입니다. 호선별로 정리했으며 역·출구·도보 시간을 함께 표시합니다. 당일치기·1박2일 코스 짜기에 활용해 보세요.',
  photoId: 'kr-subway',
  src: gallerySrc('kr-subway'),
  catalog: true,
  sort: 7,
  spotCount: 0,
}

function spot(n, line, station, name, body, tip, photoId, extra = {}) {
  return {
    id: `spot-kr-subway-${n}`,
    cityId: 'info-kr-subway',
    name,
    body,
    tip,
    sort: n,
    catalog: true,
    market: 'kr',
    photoId,
    subwayLine: line,
    subwayStation: station,
    subwayRegion: extra.region || 'seoul',
    subwayExit: extra.exit || '',
    walkMin: extra.walkMin,
  }
}

/** @type {import('../types').TravelSpot[]} */
export const KR_SUBWAY_SPOT_CATALOG = [
  spot(1, 'line-1', '시청', '덕수궁', '석조전과 정원이 어우러진 조선 궁궐입니다.', '대한문 앞 광장 산책', 'spot-kr-seoul-3', { exit: '1·2번', walkMin: 3 }),
  spot(2, 'line-1', '종각', '인사동·종로', '전통 공예·갤러리·골목 맛집 거리입니다.', '골목 카페·한복 체험', 'spot-kr-seoul-8', { exit: '3번', walkMin: 5 }),
  spot(3, 'line-1', '광명', '광명동굴', '폐광을 재생한 동굴 테마공간과 전시입니다.', '동굴 내부 체험·야경', 'spot-kr-gyeonggi-9', { region: 'gyeonggi', exit: '1번', walkMin: 8 }),
  spot(4, 'line-1', '수원', '수원화성', 'UNESCO 세계유산 성곽 산책과 화성행궁입니다.', '행궁·화홍문 일대', 'spot-kr-gyeonggi-15', { region: 'gyeonggi', exit: '4번', walkMin: 10 }),

  spot(5, 'line-2', '홍대입구', '홍대·연남동', '젊은 문화·거리 공연·카페 골목입니다.', '연남동 카페거리 연계', 'spot-kr-seoul-15', { exit: '9번', walkMin: 5 }),
  spot(6, 'line-2', '을지로3가', '명동', '쇼핑·성당·남산 둘레길 연계 거리입니다.', '명동성당·거리음식', 'spot-kr-seoul-13', { exit: '5·6번', walkMin: 3 }),
  spot(7, 'line-2', '동대문역사문화공원', '동대문디자인플라자(DDP)', '자하드 건축과 야간 LED 쇼입니다.', 'DDP 야경·디자인 상점', 'spot-kr-seoul-12', { exit: '1번', walkMin: 2 }),
  spot(8, 'line-2', '삼성', 'COEX·별마당도서관', '대형 전시·쇼핑·도서관 복합 공간입니다.', '별마당도서관 포토존', 'spot-kr-seoul-17', { exit: '6번', walkMin: 5 }),
  spot(9, 'line-2', '잠실', '롯데월드타워·석촌호', '전망대·쇼핑·호수 산책입니다.', 'SEOUL SKY 전망대', 'spot-kr-seoul-18', { exit: '2번', walkMin: 5 }),
  spot(10, 'line-2', '뚝섬유원지', '서울숲', '도심 공원·사슴·벚꽃 명소입니다.', '공원 전역 산책', 'spot-kr-seoul-11', { exit: '8번', walkMin: 5 }),

  spot(11, 'line-3', '경복궁', '경복궁', '조선 왕조 대표 궁궐입니다.', '근정전·경회루', 'spot-kr-seoul-1', { exit: '5번', walkMin: 5 }),
  spot(12, 'line-3', '안국', '북촌한옥마을', '전통 한옥 골목과 카페 거리입니다.', '한옥 골목 산책', 'spot-kr-seoul-7', { exit: '2번', walkMin: 5 }),
  spot(13, 'line-3', '종로3가', '창덕궁·후원', 'UNESCO 궁궐과 비밀정원 산책입니다.', '후원 예약·단풍', 'spot-kr-seoul-2', { exit: '6번', walkMin: 8 }),

  spot(14, 'line-4', '이촌', '국립중앙박물관', '한국 대표 박물관 전시관입니다.', '용산가족공원 연계', 'spot-kr-seoul-4', { exit: '2번', walkMin: 7 }),
  spot(15, 'line-4', '명동', 'N서울타워', '남산 전망대·케이블카 야경입니다.', '케이블카·전망대', 'spot-kr-seoul-6', { exit: '3번', walkMin: 15 }),
  spot(16, 'line-4', '정부과천청사', '서울랜드', '테마파크와 꽃 축제 공원입니다.', '과천·대공원 연계', 'spot-kr-gyeonggi-6', { region: 'gyeonggi', exit: '5·6번', walkMin: 10 }),
  spot(17, 'line-4', '정부과천청사', '국립과천과학관', '과학 체험 박물관입니다.', '대공원·서울랜드 인근', 'spot-kr-gyeonggi-13', { region: 'gyeonggi', exit: '5·6번', walkMin: 8 }),

  spot(18, 'line-5', '광화문', '광화문광장', '세종·이순신 동상과 광장 산책입니다.', '광화문·세종로', 'spot-kr-seoul-9', { exit: '2번', walkMin: 3 }),
  spot(19, 'line-5', '여의나루', '여의도 한강공원', '피크닉·자전거·벚꽃 한강 산책입니다.', '여의도공원 연계', 'spot-kr-seoul-10', { exit: '2·3번', walkMin: 5 }),

  spot(20, 'line-6', '이태원', '이태원·경리단길', '다국적 거리와 카페·야경입니다.', '경리단길·해밀턴호텔', 'spot-kr-seoul-14', { exit: '1번', walkMin: 5 }),

  spot(21, 'line-8', '몽촌토성', '올림픽공원', '1988 올림픽 유적과 넓은 공원입니다.', '몽촌토성·조각공원', 'spot-kr-subway-21', { exit: '1번', walkMin: 3 }),
  spot(22, 'line-8', '잠실', '롯데월드', '실내외 테마파크와 어드벤처입니다.', '롯데월드·석촌호', 'spot-kr-seoul-18', { exit: '4번', walkMin: 5 }),

  spot(23, 'line-9', '봉은사', '봉은사·코엑스', '사찰과 COEX·별마당 연계 코스입니다.', '봉은사 → COEX 도보', 'spot-kr-seoul-17', { exit: '1번', walkMin: 8 }),
  spot(24, 'line-9', '김포공항', '김포공항', '국내선 허브와 공항 카페·쇼핑입니다.', '국내선 터미널', 'spot-kr-subway-24', { exit: '3번', walkMin: 3 }),

  spot(25, 'line-airport', '인천공항1터미널', '인천국제공항', '국제선 허브·면세·공항 라운지입니다.', 'T1·T2 셔틀', 'spot-kr-subway-25', { region: 'incheon', exit: '1번', walkMin: 5 }),

  spot(26, 'line-gyeongui', '수원', '수원화성(경의중앙)', '경의중앙선 수원역에서 화성까지 도보·버스입니다.', '화성행궁·팔달문', 'spot-kr-gyeonggi-15', { region: 'gyeonggi', exit: '1번', walkMin: 12 }),
  spot(27, 'line-gyeongui', '문산', '파주 임진각', '평화누리공원과 망밭단길입니다.', 'DMZ·임진각', 'spot-kr-gyeonggi-14', { region: 'gyeonggi', exit: '1번', walkMin: 10 }),
  spot(28, 'line-gyeongui', '행신', '헤이리 예술마을', '갤러리·카페·공방 마을입니다.', '행신역 버스 환승', 'spot-kr-gyeonggi-5', { region: 'gyeonggi', exit: '1번', walkMin: 25 }),

  spot(29, 'line-bundang', '서울숲', '서울숲(분당선)', '분당선 서울숲역에서 바로 접근합니다.', '공원·사슴데크', 'spot-kr-seoul-11', { exit: '3번', walkMin: 3 }),
  spot(30, 'line-bundang', '기흥', '에버랜드', '용인 에버랜드·캐리비안베이 연계입니다.', '기흥역 셔틀버스', 'spot-kr-gyeonggi-1', { region: 'gyeonggi', exit: '4번', walkMin: 20 }),

  spot(31, 'line-shinbundang', '강남', '강남·가로수길', '쇼핑·카페·갤러리 거리입니다.', '신사·압구정 연계', 'spot-kr-seoul-17', { exit: '11번', walkMin: 8 }),

  spot(32, 'line-incheon-1', '인천', '차이나타운', '중국풍 거리·짜장면·삼국지 벽화입니다.', '인천역 차이나타운', 'spot-kr-subway-32', { region: 'incheon', exit: '1번', walkMin: 5 }),
  spot(33, 'line-incheon-1', '월미바다', '월미도', '해안 산책·놀이공원·갯벌 체험입니다.', '월미바다역', 'spot-kr-subway-33', { region: 'incheon', exit: '1번', walkMin: 5 }),
  spot(34, 'line-incheon-1', '센트럴파크', '송도센트럴파크', '국제도시 송도의 호수·야경 공원입니다.', '트라이볼·G타워', 'spot-kr-subway-34', { region: 'incheon', exit: '1번', walkMin: 5 }),

  spot(35, 'line-incheon-2', '송도달빛축제공원', '송도달빛축제공원', '해안공원과 야경·축제 공간입니다.', '달빛축제공원', 'spot-kr-subway-35', { region: 'incheon', exit: '1번', walkMin: 3 }),
  spot(36, 'line-incheon-2', '컨벤시아', '송도컨벤시아·커낼워크', '국제회의장과 해상 산책로입니다.', '커낼워크 야경', 'spot-kr-subway-36', { region: 'incheon', exit: '1번', walkMin: 5 }),
]

KR_SUBWAY_TRAVEL_INFO.spotCount = KR_SUBWAY_SPOT_CATALOG.length
