/** 수도권 지하철 노선별 관광지 — 서울·인천·경기 (100선+ 역별 확장) */

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
  body: '수도권 지하철 노선별 역 주변 관광지입니다. 호선·역·출구·도보 시간을 함께 표시합니다. 당일치기·1박2일 코스 짜기에 활용해 보세요.',
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

/** [line, station, name, body, tip, photoId, extra?] */
const RAW = [
  // ── 1호선 ──
  ['line-1', '시청', '덕수궁', '석조전과 정원이 어우러진 조선 궁궐입니다.', '대한문 앞 광장 산책', 'spot-kr-seoul-3', { exit: '1·2번', walkMin: 3 }],
  ['line-1', '종각', '인사동·종로', '전통 공예·갤러리·골목 맛집 거리입니다.', '골목 카페·한복 체험', 'spot-kr-seoul-8', { exit: '3번', walkMin: 5 }],
  ['line-1', '종각', '청계천', '도심 복원 수변 산책로와 야경 명소입니다.', '청계천 플라자·보행교', 'spot-kr-subway-37', { exit: '5번', walkMin: 3 }],
  ['line-1', '종로3가', '탑골공원·종묘길', '탑동·종묘 인근 전통 거리 산책입니다.', '종묘·광장시장 연계', 'spot-kr-subway-50', { exit: '2번', walkMin: 5 }],
  ['line-1', '동대문', '동대문 종합시장', '패션·잡화 도매·소매 시장입니다.', 'DDP와 연계 산책', 'spot-kr-subway-47', { exit: '6·7번', walkMin: 5 }],
  ['line-1', '서울역', '문화역서울284', '구 서울역사를 복원한 문화·전시 공간입니다.', '서울로·남대문 연계', 'spot-kr-subway-38', { exit: '2번', walkMin: 3 }],
  ['line-1', '서울역', '남대문시장', '전통 시장과 먹거리 골목입니다.', '회현역과도 도보 연계', 'spot-kr-subway-46', { exit: '3번', walkMin: 10 }],
  ['line-1', '광명', '광명동굴', '폐광을 재생한 동굴 테마공간과 전시입니다.', '동굴 내부 체험·야경', 'spot-kr-gyeonggi-9', { region: 'gyeonggi', exit: '1번', walkMin: 8 }],
  ['line-1', '수원', '수원화성', 'UNESCO 세계유산 성곽 산책과 화성행궁입니다.', '행궁·화홍문 일대', 'spot-kr-gyeonggi-15', { region: 'gyeonggi', exit: '4번', walkMin: 10 }],

  // ── 2호선 ──
  ['line-2', '시청', '덕수궁(2호선)', '시청역에서 덕수궁 대한문까지 도보입니다.', '2호선·1호선 환승', 'spot-kr-seoul-3', { exit: '12번', walkMin: 5 }],
  ['line-2', '을지로3가', '명동', '쇼핑·성당·남산 둘레길 연계 거리입니다.', '명동성당·거리음식', 'spot-kr-seoul-13', { exit: '5·6번', walkMin: 3 }],
  ['line-2', '을지로4가', '을지로·빈티지골목', '레트로 카페·인디 공간이 모인 골목입니다.', '을지로 골목 투어', 'spot-kr-seoul-13', { exit: '2번', walkMin: 5 }],
  ['line-2', '동대문역사문화공원', '동대문디자인플라자(DDP)', '자하드 건축과 야간 LED 쇼입니다.', 'DDP 야경·디자인 상점', 'spot-kr-seoul-12', { exit: '1번', walkMin: 2 }],
  ['line-2', '동대문역사문화공원', '동대문 디자인플라자 야경', 'DDP와 동대문 시장·운동장 일대입니다.', '야간 LED·전시', 'spot-kr-seoul-12', { exit: '1번', walkMin: 2 }],
  ['line-2', '신당', '동대문 패션타운', '동대문 패션·도매 상권입니다.', '종합시장·DDP 연계', 'spot-kr-subway-47', { exit: '6번', walkMin: 8 }],
  ['line-2', '홍대입구', '홍대·연남동', '젊은 문화·거리 공연·카페 골목입니다.', '연남동 카페거리 연계', 'spot-kr-seoul-15', { exit: '9번', walkMin: 5 }],
  ['line-2', '신촌', '신촌·연세대', '대학가·쇼핑·거리 공연 거리입니다.', '연세대·이대 연계', 'spot-kr-subway-41', { exit: '2·3번', walkMin: 5 }],
  ['line-2', '이대', '이화여대·신촌', '벚꽃·캠퍼스·신촌 상권 연계입니다.', '이대역 벚꽃길', 'spot-kr-subway-41', { exit: '1번', walkMin: 5 }],
  ['line-2', '뚝섬유원지', '서울숲', '도심 공원·사슴·벚꽃 명소입니다.', '공원 전역 산책', 'spot-kr-seoul-11', { exit: '8번', walkMin: 5 }],
  ['line-2', '뚝섬', '뚝섬 한강공원', '한강 자전거·피크닉·수변 산책입니다.', '뚝섬유원지 연계', 'spot-kr-seoul-10', { exit: '1번', walkMin: 5 }],
  ['line-2', '성수', '성수동 카페·공방', '카페·갤러리·공방이 모인 핫플레이스입니다.', '성수동 카페거리', 'spot-kr-subway-42', { exit: '2번', walkMin: 5 }],
  ['line-2', '건대입구', '건대·화양시장', '대학가·먹자골목·공연 거리입니다.', '7호선 환승', 'spot-kr-subway-43', { exit: '1·2번', walkMin: 3 }],
  ['line-2', '삼성', 'COEX·별마당도서관', '대형 전시·쇼핑·도서관 복합 공간입니다.', '별마당도서관 포토존', 'spot-kr-seoul-17', { exit: '6번', walkMin: 5 }],
  ['line-2', '잠실', '롯데월드타워·석촌호', '전망대·쇼핑·호수 산책입니다.', 'SEOUL SKY 전망대', 'spot-kr-seoul-18', { exit: '2번', walkMin: 5 }],
  ['line-2', '잠실', '롯데월드', '실내외 테마파크와 어드벤처입니다.', '롯데월드·석촌호', 'spot-kr-seoul-18', { exit: '4번', walkMin: 5 }],

  // ── 3호선 ──
  ['line-3', '경복궁', '경복궁', '조선 왕조 대표 궁궐입니다.', '근정전·경회루', 'spot-kr-seoul-1', { exit: '5번', walkMin: 5 }],
  ['line-3', '경복궁', '국립고궁박물관', '조선 왕실 유물 전시관입니다.', '경복궁 동쪽', 'spot-kr-seoul-1', { exit: '5번', walkMin: 7 }],
  ['line-3', '안국', '북촌한옥마을', '전통 한옥 골목과 카페 거리입니다.', '한옥 골목 산책', 'spot-kr-seoul-7', { exit: '2번', walkMin: 5 }],
  ['line-3', '안국', '국립현대미술관 서울', '현대미술과 삼청동 산책로입니다.', '삼청동·북촌 연계', 'spot-kr-seoul-5', { exit: '1번', walkMin: 8 }],
  ['line-3', '안국', '삼청동·가회동', '한옥·갤러리·카페 골목 산책입니다.', '북촌·창덕궁 연계', 'spot-kr-subway-40', { exit: '1번', walkMin: 5 }],
  ['line-3', '종로3가', '창덕궁·후원', 'UNESCO 궁궐과 비밀정원 산책입니다.', '후원 예약·단풍', 'spot-kr-seoul-2', { exit: '6번', walkMin: 8 }],
  ['line-3', '종로3가', '인사동·탭골공원', '전통 거리와 탑골공원 일대입니다.', '1호선·3호선 환승', 'spot-kr-seoul-8', { exit: '5번', walkMin: 3 }],
  ['line-3', '경복궁', '청와대·오픈하우스', '대통령 관저 역사·정원 투어입니다.', '사전 예약 필수', 'spot-kr-seoul-10', { exit: '5번', walkMin: 10 }],
  ['line-3', '안국', '돈의문·숭례문', '조선 시대 도성 남문 유적입니다.', '서울시립미술관 연계', 'spot-kr-seoul-9', { exit: '2번', walkMin: 10 }],

  // ── 4호선 ──
  ['line-4', '회현', '남대문시장', '전통 시장과 먹거리·패션 상권입니다.', '남대문·회현역', 'spot-kr-subway-46', { exit: '5번', walkMin: 3 }],
  ['line-4', '명동', '명동·남산순환', '쇼핑·성당·남산 둘레길입니다.', '명동성당', 'spot-kr-seoul-13', { exit: '3번', walkMin: 3 }],
  ['line-4', '명동', 'N서울타워', '남산 전망대·케이블카 야경입니다.', '케이블카·전망대', 'spot-kr-seoul-6', { exit: '3번', walkMin: 15 }],
  ['line-4', '이촌', '국립중앙박물관', '한국 대표 박물관 전시관입니다.', '용산가족공원 연계', 'spot-kr-seoul-4', { exit: '2번', walkMin: 7 }],
  ['line-4', '이촌', '이촌 한강공원', '한강 수변·자전거·피크닉 공원입니다.', '이촌역 한강 진입', 'spot-kr-seoul-10', { exit: '4번', walkMin: 5 }],
  ['line-4', '동대문역사문화공원', 'DDP(4호선)', '동대문 DDP·디자인 전시·야경입니다.', '2호선 환승', 'spot-kr-seoul-12', { exit: '7·8번', walkMin: 3 }],
  ['line-4', '혜화', '대학로', '연극·뮤지컬·젊은 문화 거리입니다.', '마로니에공원', 'spot-kr-subway-49', { exit: '2번', walkMin: 3 }],
  ['line-4', '혜화', '창경궁', '조선 후기 궁궐과 동물원·정원입니다.', '대학로 연계', 'spot-kr-subway-49', { exit: '4번', walkMin: 8 }],
  ['line-4', '삼각지', '전쟁기념관', '역사 전시와 넓은 기념 공원입니다.', '6호선 환승', 'spot-kr-seoul-19', { exit: '12번', walkMin: 5 }],
  ['line-4', '정부과천청사', '서울랜드', '테마파크와 꽃 축제 공원입니다.', '과천·대공원 연계', 'spot-kr-gyeonggi-6', { region: 'gyeonggi', exit: '5·6번', walkMin: 10 }],
  ['line-4', '정부과천청사', '국립과천과학관', '과학 체험 박물관입니다.', '대공원·서울랜드 인근', 'spot-kr-gyeonggi-13', { region: 'gyeonggi', exit: '5·6번', walkMin: 8 }],
  ['line-4', '정부과천청사', '국립현대미술관 과천', '현대미술 전시와 산책로입니다.', '서울대공원 연계', 'spot-kr-gyeonggi-12', { region: 'gyeonggi', exit: '5·6번', walkMin: 10 }],

  // ── 5호선 ──
  ['line-5', '광화문', '광화문광장', '세종·이순신 동상과 광장 산책입니다.', '광화문·세종로', 'spot-kr-seoul-9', { exit: '2번', walkMin: 3 }],
  ['line-5', '광화문', '청계천(광화문)', '광화문~청계천 보행 산책로입니다.', '청계광장', 'spot-kr-subway-37', { exit: '2번', walkMin: 2 }],
  ['line-5', '여의나루', '여의도 한강공원', '피크닉·자전거·벚꽃 한강 산책입니다.', '여의도공원 연계', 'spot-kr-seoul-10', { exit: '2·3번', walkMin: 5 }],
  ['line-5', '여의나루', '63빌딩·여의도', '전망대·한강 조망·금융가 산책입니다.', '63스퀘어', 'spot-kr-subway-51', { exit: '1번', walkMin: 8 }],
  ['line-5', '종로3가', '종묘', '조선 왕실 종묘와 전통 제례 유적입니다.', '1·3·5호선 환승', 'spot-kr-subway-50', { exit: '8번', walkMin: 5 }],
  ['line-5', '광화문', '세종·이순신 동상', '광화문광장 조형물·분수·야경입니다.', '광화문광장 중심', 'spot-kr-seoul-9', { exit: '2번', walkMin: 2 }],
  ['line-5', '여의도', '국회의사당', '국회 건물·여의도 공원 산책입니다.', '9호선 환승', 'spot-kr-seoul-10', { exit: '1번', walkMin: 5 }],

  // ── 6호선 ──
  ['line-6', '이태원', '이태원·경리단길', '다국적 거리와 카페·야경입니다.', '경리단길·해밀턴호텔', 'spot-kr-seoul-14', { exit: '1번', walkMin: 5 }],
  ['line-6', '삼각지', '전쟁기념관(6호선)', '4호선 삼각지역 전쟁기념관입니다.', '4호선 환승', 'spot-kr-seoul-19', { exit: '12번', walkMin: 5 }],
  ['line-6', '한강진', '한국전쟁기념관·용산', '용산·전쟁기념관 인근 산책입니다.', '전쟁기념관 도보', 'spot-kr-seoul-19', { exit: '2번', walkMin: 10 }],
  ['line-6', '망원', '망원 한강공원', '한강 피크닉·자전거·망원시장 연계입니다.', '망원시장', 'spot-kr-subway-52', { exit: '2번', walkMin: 5 }],
  ['line-6', '합정', '홍대·합정', '홍대 인근 카페·공연·맛집 거리입니다.', '2호선 환승', 'spot-kr-seoul-15', { exit: '1번', walkMin: 8 }],
  ['line-6', '응봉', '응봉·한강 조망', '한강 전망·동네 산책로입니다.', '한강 접근', 'spot-kr-seoul-10', { exit: '1번', walkMin: 10 }],

  // ── 7호선 ──
  ['line-7', '건대입구', '어린이대공원', '동물원·놀이·공원이 어우러진 도심 공원입니다.', '2호선 환승', 'spot-kr-subway-44', { exit: '2번', walkMin: 5 }],
  ['line-7', '건대입구', '건대·공연장', '대학가·공연·먹자골목입니다.', '화양시장', 'spot-kr-subway-43', { exit: '1번', walkMin: 3 }],
  ['line-7', '반포', '반포 한강공원', '반포대교 달빛무지개분수·피크닉 명소입니다.', '세빛섬·유람선', 'spot-kr-subway-45', { exit: '1·2번', walkMin: 5 }],
  ['line-7', '반포', '반포대교 야경', '한강·반포대교 야경·분수 쇼입니다.', '달빛무지개분수', 'spot-kr-subway-45', { exit: '1번', walkMin: 8 }],
  ['line-7', '잠원', '잠원·한강', '잠원 한강공원·조깅·피크닉 코스입니다.', '신사·압구정 연계', 'spot-kr-seoul-10', { exit: '1번', walkMin: 8 }],
  ['line-7', '청담', '청담·압구정', '명품·카페·갤러리 거리입니다.', '신분당선 환승', 'spot-kr-seoul-17', { exit: '9번', walkMin: 8 }],
  ['line-7', '논현', '논현·강남', '강남 접근·카페·쇼핑 거리입니다.', '9호선 환승', 'spot-kr-seoul-17', { exit: '1번', walkMin: 10 }],
  ['line-7', '노원', '노원·태릉', '태릉·유네스코 왕릉·공원 산책입니다.', '6·7호선 환승', 'spot-kr-subway-56', { exit: '4번', walkMin: 15 }],

  // ── 8호선 ──
  ['line-8', '몽촌토성', '올림픽공원', '1988 올림픽 유적과 넓은 공원입니다.', '몽촌토성·조각공원', 'spot-kr-subway-21', { exit: '1번', walkMin: 3 }],
  ['line-8', '잠실', '롯데월드(8호선)', '잠실 롯데월드·석촌호 일대입니다.', '2호선 환승', 'spot-kr-seoul-18', { exit: '4번', walkMin: 5 }],
  ['line-8', '석촌', '석촌호', '호수 산책·벚꽃·야경 명소입니다.', '롯데타워 연계', 'spot-kr-seoul-18', { exit: '1번', walkMin: 5 }],

  // ── 9호선 ──
  ['line-9', '봉은사', '봉은사·코엑스', '사찰과 COEX·별마당 연계 코스입니다.', '봉은사 → COEX 도보', 'spot-kr-seoul-17', { exit: '1번', walkMin: 8 }],
  ['line-9', '김포공항', '김포공항', '국내선 허브와 공항 카페·쇼핑입니다.', '국내선 터미널', 'spot-kr-subway-24', { exit: '3번', walkMin: 3 }],
  ['line-9', '국회의사당', '국회·여의도', '국회의사당·여의도 한강 연계입니다.', '5호선 환승', 'spot-kr-seoul-10', { exit: '1번', walkMin: 5 }],
  ['line-9', '신반포', '반포·세빛섬', '한강 유람선·세빛섬·반포 일대입니다.', '7호선 반포 연계', 'spot-kr-subway-45', { exit: '1번', walkMin: 10 }],
  ['line-9', '선정릉', '선정릉·삼성', '조선 왕릉과 강남 접근 거점입니다.', 'COEX·삼성역 연계', 'spot-kr-seoul-17', { exit: '1번', walkMin: 8 }],

  // ── 공항철도 ──
  ['line-airport', '인천공항1터미널', '인천국제공항', '국제선 허브·면세·공항 라운지입니다.', 'T1·T2 셔틀', 'spot-kr-subway-25', { region: 'incheon', exit: '1번', walkMin: 5 }],
  ['line-airport', '인천공항2터미널', '인천공항 T2', 'T2 국제선·면세·라운지입니다.', 'T1 셔틀', 'spot-kr-subway-25', { region: 'incheon', exit: '1번', walkMin: 5 }],
  ['line-airport', '서울역', '공항철도 서울역', '직통·일반열차 환승 거점입니다.', 'KTX·1·4호선 환승', 'spot-kr-subway-38', { exit: '14번', walkMin: 3 }],

  // ── 경의·중앙 ──
  ['line-gyeongui', '수원', '수원화성(경의중앙)', '경의중앙선 수원역에서 화성까지입니다.', '화성행궁·팔달문', 'spot-kr-gyeonggi-15', { region: 'gyeonggi', exit: '1번', walkMin: 12 }],
  ['line-gyeongui', '문산', '파주 임진각', '평화누리공원과 망밭단길입니다.', 'DMZ·임진각', 'spot-kr-gyeonggi-14', { region: 'gyeonggi', exit: '1번', walkMin: 10 }],
  ['line-gyeongui', '행신', '헤이리 예술마을', '갤러리·카페·공방 마을입니다.', '행신역 버스 환승', 'spot-kr-gyeonggi-5', { region: 'gyeonggi', exit: '1번', walkMin: 25 }],
  ['line-gyeongui', '문산', 'DMZ 생생누리', 'DMZ 평화·생태 체험 시설입니다.', '임진각 인근 버스', 'spot-kr-subway-54', { region: 'gyeonggi', exit: '1번', walkMin: 20 }],
  ['line-gyeongui', '디지털미디어시티', 'DMC·상암', 'MBC·디지털미디어시티 일대입니다.', '6호선 환승', 'spot-kr-seoul-10', { exit: '1번', walkMin: 5 }],
  ['line-gyeongui', '용산', '용산·전쟁기념관', '용산역·전쟁기념관·국립중앙박물관 연계입니다.', '4호선 환승', 'spot-kr-seoul-19', { exit: '2번', walkMin: 10 }],

  // ── 수인분당 ──
  ['line-bundang', '서울숲', '서울숲(분당선)', '분당선 서울숲역에서 바로 접근합니다.', '공원·사슴데크', 'spot-kr-seoul-11', { exit: '3번', walkMin: 3 }],
  ['line-bundang', '기흥', '에버랜드', '용인 에버랜드·캐리비안베이 연계입니다.', '기흥역 셔틀버스', 'spot-kr-gyeonggi-1', { region: 'gyeonggi', exit: '4번', walkMin: 20 }],
  ['line-bundang', '기흥', '한국민속촌', '전통 마을과 공연·체험입니다.', '기흥역 버스 환승', 'spot-kr-subway-55', { region: 'gyeonggi', exit: '4번', walkMin: 25 }],
  ['line-bundang', '판교', '판교·신사', 'IT단지·카페·쇼핑 거리입니다.', '신분당선 환승', 'spot-kr-seoul-17', { exit: '1번', walkMin: 10 }],
  ['line-bundang', '정자', '정자·분당', '분당 신도시·카페·공원 산책입니다.', '수인분당선', 'spot-kr-gyeonggi-5', { region: 'gyeonggi', exit: '1번', walkMin: 5 }],

  // ── 신분당 ──
  ['line-shinbundang', '강남', '강남·가로수길', '쇼핑·카페·갤러리 거리입니다.', '신사·압구정 연계', 'spot-kr-seoul-17', { exit: '11번', walkMin: 8 }],
  ['line-shinbundang', '신사', '신사·가로수길', '카페·부티크·갤러리 거리입니다.', '3호선 환승', 'spot-kr-seoul-17', { exit: '8번', walkMin: 5 }],
  ['line-shinbundang', '양재', '양재·서초', '양재꽃시장·서초 접근 거점입니다.', '3호선 환승', 'spot-kr-seoul-17', { exit: '1번', walkMin: 8 }],

  // ── 인천1호선 ──
  ['line-incheon-1', '인천', '차이나타운', '중국풍 거리·짜장면·삼국지 벽화입니다.', '인천역 차이나타운', 'spot-kr-subway-32', { region: 'incheon', exit: '1번', walkMin: 5 }],
  ['line-incheon-1', '월미바다', '월미도', '해안 산책·놀이공원·갯벌 체험입니다.', '월미바다역', 'spot-kr-subway-33', { region: 'incheon', exit: '1번', walkMin: 5 }],
  ['line-incheon-1', '센트럴파크', '송도센트럴파크', '국제도시 송도의 호수·야경 공원입니다.', '트라이볼·G타워', 'spot-kr-subway-34', { region: 'incheon', exit: '1번', walkMin: 5 }],
  ['line-incheon-1', '인천역', '개항장·인천역', '개항 역사·근대 건축 거리입니다.', '차이나타운 연계', 'spot-kr-subway-32', { region: 'incheon', exit: '1번', walkMin: 3 }],
  ['line-incheon-1', '부평', '부평역·상권', '부평 먹자골목·쇼핑 거리입니다.', '1호선 환승', 'spot-kr-subway-57', { region: 'incheon', exit: '1번', walkMin: 3 }],
  ['line-incheon-1', '송도', '송도국제도시', '국제업무·주거·공원 복합 도시입니다.', '센트럴파크 연계', 'spot-kr-subway-34', { region: 'incheon', exit: '1번', walkMin: 10 }],

  // ── 인천2호선 ──
  ['line-incheon-2', '송도달빛축제공원', '송도달빛축제공원', '해안공원과 야경·축제 공간입니다.', '달빛축제공원', 'spot-kr-subway-35', { region: 'incheon', exit: '1번', walkMin: 3 }],
  ['line-incheon-2', '컨벤시아', '송도컨벤시아·커낼워크', '국제회의장과 해상 산책로입니다.', '커낼워크 야경', 'spot-kr-subway-36', { region: 'incheon', exit: '1번', walkMin: 5 }],
  ['line-incheon-2', '인천대공원', '인천대공원', '넓은 공원·동물원·가족 나들이 명소입니다.', '인천2호선 종점 인근', 'spot-kr-subway-34', { region: 'incheon', exit: '1번', walkMin: 10 }],
  ['line-incheon-2', '검단사거리', '검단·서구', '검단신도시·쇼핑·공원 일대입니다.', '인천 서부', 'spot-kr-subway-34', { region: 'incheon', exit: '1번', walkMin: 8 }],
  ['line-incheon-2', '아시아드경기장', '아시아드경기장', '2014 인천 아시안게임 메인 경기장입니다.', '송도 인근', 'spot-kr-subway-35', { region: 'incheon', exit: '1번', walkMin: 8 }],
]

/** @type {import('../types').TravelSpot[]} */
export const KR_SUBWAY_SPOT_CATALOG = RAW.map((row, index) =>
  spot(index + 1, row[0], row[1], row[2], row[3], row[4], row[5], row[6] || {}),
)

KR_SUBWAY_TRAVEL_INFO.spotCount = KR_SUBWAY_SPOT_CATALOG.length
