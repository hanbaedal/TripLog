import type { GalleryPhoto } from '../types'
import { GALLERY_PHOTOS } from './galleryCatalog.js'

const CATALOG = GALLERY_PHOTOS as GalleryPhoto[]

function clean(url: string): string {
  return url.split('?')[0]
}

function wm(file: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`
}

const BY_TITLE: Record<string, string> = {
  자금성: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/The_Forbidden_City_-_View_from_Coal_Hill.jpg/960px-The_Forbidden_City_-_View_from_Coal_Hill.jpg',
  ),
  '만리장성 무티엔위': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Great_Wall_of_China_July_2006.JPG/960px-Great_Wall_of_China_July_2006.JPG',
  ),
  이화원: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Longevity_Hill_of_the_Summer_Palace.jpg/960px-Longevity_Hill_of_the_Summer_Palace.jpg',
  ),
  '798 예술구': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Beijing_798_Art_District.jpg/960px-Beijing_798_Art_District.jpg',
  ),
  '천안문 광장': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Tiananmen_Square_%2854137047250%29.jpg/960px-Tiananmen_Square_%2854137047250%29.jpg',
  ),
  외탄: clean('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Bund_2.jpg/960px-The_Bund_2.jpg'),
  위위안: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Shanghai_-_Yu_Garden_-_0035.jpg/960px-Shanghai_-_Yu_Garden_-_0035.jpg',
  ),
  티엔쯔팡: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Shanghai_Tianzifang_%E4%B8%8A%E6%B5%B7%E7%94%B0%E5%AD%90%E5%9D%8A_-_panoramio.jpg/960px-Shanghai_Tianzifang_%E4%B8%8A%E6%B5%B7%E7%94%B0%E5%AD%90%E5%9D%8A_-_panoramio.jpg',
  ),
  동방명주: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Oriental_Pearl_Tower_20251126.jpg/960px-Oriental_Pearl_Tower_20251126.jpg',
  ),
  난징루: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/East_Nanjing_Road_2020_%2850361842166%29.jpg/960px-East_Nanjing_Road_2020_%2850361842166%29.jpg',
  ),
  침사추이: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vista_del_Puerto_de_Victoria_desde_Sky100%2C_Hong_Kong%2C_2013-08-09%2C_DD_10.JPG/960px-Vista_del_Puerto_de_Victoria_desde_Sky100%2C_Hong_Kong%2C_2013-08-09%2C_DD_10.JPG',
  ),
  빅토리아피크: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/High_West_and_Victoria_Peak_from_Victoria_Gap_%28crop1%29.jpg/960px-High_West_and_Victoria_Peak_from_Victoria_Gap_%28crop1%29.jpg',
  ),
  리펄스베이: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/View_of_Repulse_Bay_from_Sir_Cecil%27s_Ride.jpg/960px-View_of_Repulse_Bay_from_Sir_Cecil%27s_Ride.jpg',
  ),
  스탠리: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/View_of_Repulse_Bay_from_Sir_Cecil%27s_Ride.jpg/960px-View_of_Repulse_Bay_from_Sir_Cecil%27s_Ride.jpg',
  ),
  템플스트리트: wm('Temple Street Night Market.jpg'),
  스타페리: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tsim_Sha_Tsui_Ferry_Pier.jpg/960px-Tsim_Sha_Tsui_Ferry_Pier.jpg',
  ),
  '백두산 천지': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/%E4%BB%8E%E9%95%BF%E7%99%BD%E5%B1%B1%E8%A5%BF%E5%9D%A1%E7%9C%8B%E5%A4%A9%E6%B1%A0-2017-08-24_1.jpg/960px-%E4%BB%8E%E9%95%BF%E7%99%BD%E5%B1%B1%E8%A5%BF%E5%9D%A1%E7%9C%8B%E5%A4%A9%E6%B1%A0-2017-08-24_1.jpg',
  ),
  '창바이 폭포': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Laika_ac_Mt._Paekdu_%287998657081%29.jpg/960px-Laika_ac_Mt._Paekdu_%287998657081%29.jpg',
  ),
  옌지: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/%E5%BB%B6%E5%90%89%E5%B8%82%E4%B8%AD%E5%BF%83.jpg/960px-%E5%BB%B6%E5%90%89%E5%B8%82%E4%B8%AD%E5%BF%83.jpg',
  ),
  '옌지 모아산': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/%E5%BB%B6%E5%90%89%E5%B8%82%E4%B8%AD%E5%BF%83.jpg/960px-%E5%BB%B6%E5%90%89%E5%B8%82%E4%B8%AD%E5%BF%83.jpg',
  ),
  '옌지 민속원': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/%E5%BB%B6%E5%90%89%E5%B8%82%E4%B8%AD%E5%BF%83.jpg/960px-%E5%BB%B6%E5%90%89%E5%B8%82%E4%B8%AD%E5%BF%83.jpg',
  ),
  쿠안자이샹즈: wm('Wide and Narrow Alley.jpg'),
  '청두 판다기지': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Chengdu_Research_Base_Eingang.jpg/960px-Chengdu_Research_Base_Eingang.jpg',
  ),
  무후사: wm('Wuhou Temple.jpg'),
  진리: wm('Jinli Street.jpg'),
  두푸초당: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Du_Fu_cao_tang.jpg/960px-Du_Fu_cao_tang.jpg',
  ),
  낙산대불: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/36275-Leshan_%2849067653383%29.jpg/960px-36275-Leshan_%2849067653383%29.jpg',
  ),
  인민공원: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Monument_to_the_Martyrs_of_the_Railway_Protection_Movement_-_Chengdu%2C_China_-_DSC05329.jpg/960px-Monument_to_the_Martyrs_of_the_Railway_Protection_Movement_-_Chengdu%2C_China_-_DSC05329.jpg',
  ),
  태항대협곡: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/%E5%A4%AA%E8%A1%8C%E5%B1%B1%E9%B3%A5%E7%9E%B0_%28%E6%B2%B3%E5%8D%97%E8%BC%9D%E7%B8%A3%29.jpg/960px-%E5%A4%AA%E8%A1%8C%E5%B1%B1%E9%B3%A5%E7%9E%B0_%28%E6%B2%B3%E5%8D%97%E8%BC%9D%E7%B8%A3%29.jpg',
  ),
  왕상옌: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/LinzhouHenan004.jpg/960px-LinzhouHenan004.jpg',
  ),
  훙치취: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/RedFlagCanal_TigersMouthCliff.jpg/960px-RedFlagCanal_TigersMouthCliff.jpg',
  ),
  구련산: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/%E5%A4%AA%E8%A1%8C%E5%B1%B1%E9%B3%A5%E7%9E%B0_%28%E6%B2%B3%E5%8D%97%E8%BC%9D%E7%B8%A3%29.jpg/960px-%E5%A4%AA%E8%A1%8C%E5%B1%B1%E9%B3%A5%E7%9E%B0_%28%E6%B2%B3%E5%8D%97%E8%BC%9D%E7%B8%A3%29.jpg',
  ),
  허난박물관: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/20210220_Henan_Museum_-_main_hall_01.jpg/960px-20210220_Henan_Museum_-_main_hall_01.jpg',
  ),
  '툰시 라오제': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/18892-Huangshan_%2845065618964%29.jpg/960px-18892-Huangshan_%2845065618964%29.jpg',
  ),
  황산: clean('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Huangshan_pic_4.jpg/960px-Huangshan_pic_4.jpg'),
  운곡사: clean('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Huangshan_pic_4.jpg/960px-Huangshan_pic_4.jpg'),
  연화봉: clean('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Huangshan_pic_4.jpg/960px-Huangshan_pic_4.jpg'),
  시해대협곡: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Huangshan_pic_4.jpg/960px-Huangshan_pic_4.jpg',
  ),
  훙춘: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Yixian_Hongcun_2016.09.09_17-27-03.jpg/960px-Yixian_Hongcun_2016.09.09_17-27-03.jpg',
  ),
  시디: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/%E8%A5%BF%E9%80%92%E7%89%8C%E6%A5%BC.jpg/960px-%E8%A5%BF%E9%80%92%E7%89%8C%E6%A5%BC.jpg',
  ),
  천문산: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Tianmen_38330-Zhangjiajie_%2849047525877%29.jpg/960px-Tianmen_38330-Zhangjiajie_%2849047525877%29.jpg',
  ),
  원가계: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg/960px-1_tianzishan_wulingyuan_zhangjiajie_2012.jpg',
  ),
  장가계: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg/960px-1_tianzishan_wulingyuan_zhangjiajie_2012.jpg',
  ),
  금편계: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg/960px-1_tianzishan_wulingyuan_zhangjiajie_2012.jpg',
  ),
  백룡엘리베이터: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/%E6%B9%96%E5%8D%97_%E5%BC%A0%E5%AE%B6%E7%95%8C_%E7%99%BE%E9%BE%99%E5%A4%A9%E6%A2%AF_-_panoramio.jpg/960px-%E6%B9%96%E5%8D%97_%E5%BC%A0%E5%AE%B6%E7%95%8C_%E7%99%BE%E9%BE%99%E5%A4%A9%E6%A2%AF_-_panoramio.jpg',
  ),
  유리잔도: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg/960px-1_tianzishan_wulingyuan_zhangjiajie_2012.jpg',
  ),
  보봉호: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg/960px-1_tianzishan_wulingyuan_zhangjiajie_2012.jpg',
  ),
  석림: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Shilin%2C_Yunnan_24740.jpg/960px-Shilin%2C_Yunnan_24740.jpg',
  ),
  취후: wm('Green Lake Park Kunming.jpg'),
  '다리 고대성': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Chongsheng_Temple_%2811050634113%29.jpg/960px-Chongsheng_Temple_%2811050634113%29.jpg',
  ),
  얼하이: clean(
    'https://upload.wikimedia.org/wikipedia/commons/1/1b/Erhai_lake%2C_Yunnan%2C_China.jpg',
  ),
  '리장 고성': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Lijiang_-_panoramio_%286%29.jpg/960px-Lijiang_-_panoramio_%286%29.jpg',
  ),
  옥룡설산: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Yulong_xue_shan.jpg/960px-Yulong_xue_shan.jpg',
  ),
  흑룡담: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Black_Dragon_Pool.jpg/960px-Black_Dragon_Pool.jpg',
  ),
  '황과수 대폭포': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/%E9%BB%84%E6%9E%9C%E6%A0%91%E7%80%91%E5%B8%83_2026-07-31_01.jpg/960px-%E9%BB%84%E6%9E%9C%E6%A0%91%E7%80%91%E5%B8%83_2026-07-31_01.jpg',
  ),
  칭옌고진: wm('Qingyan Ancient Town.jpg'),
  샤오치콩: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Xiaoqikong.JPG/960px-Xiaoqikong.JPG',
  ),
  자자관: wm('Jiaxiu Pavilion.jpg'),
  첸링공원: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Guizhou_Financial_City_District.jpg/960px-Guizhou_Financial_City_District.jpg',
  ),
  톈싱차오: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/%E9%BB%84%E6%9E%9C%E6%A0%91%E7%80%91%E5%B8%83_2026-07-31_01.jpg/960px-%E9%BB%84%E6%9E%9C%E6%A0%91%E7%80%91%E5%B8%83_2026-07-31_01.jpg',
  ),
  잔차오: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg/960px-Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg',
  ),
  라오산: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/20240730_Dabiao_Mountain_of_Mount_Lao_01.jpg/960px-20240730_Dabiao_Mountain_of_Mount_Lao_01.jpg',
  ),
  '스나오런 해변': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg/960px-Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg',
  ),
  '바스 옛 거리': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg/960px-Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg',
  ),
  펑라이각: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Penglai_Pavilion_viewed_from_the_southeast.jpg/960px-Penglai_Pavilion_viewed_from_the_southeast.jpg',
  ),
  '창위 와인성': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Yantai2017.jpg/960px-Yantai2017.jpg',
  ),
  '진산완 해변': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Yantai2017.jpg/960px-Yantai2017.jpg',
  ),
  연태산공원: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Yantai2017.jpg/960px-Yantai2017.jpg',
  ),
  '성 소피아 성당': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/West_facade_of_St._Sophia_Cathedral%2C_Harbin_%2820230721150450%29.jpg/960px-West_facade_of_St._Sophia_Cathedral%2C_Harbin_%2820230721150450%29.jpg',
  ),
  중앙대가: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Central_Street%2C_Harbin_16.jpg/960px-Central_Street%2C_Harbin_16.jpg',
  ),
  태양도: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/26935-Harbin_%2829661238117%29.jpg/960px-26935-Harbin_%2829661238117%29.jpg',
  ),
  '하얼빈극 거리': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/26935-Harbin_%2829661238117%29.jpg/960px-26935-Harbin_%2829661238117%29.jpg',
  ),
  '싱하이 광장': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Xigang%2C_Dalian%2C_Liaoning%2C_China_-_panoramio_%2818%29.jpg/960px-Xigang%2C_Dalian%2C_Liaoning%2C_China_-_panoramio_%2818%29.jpg',
  ),
  '뤼순 군항': wm('Lüshun Port.jpg'),
  '러시아풍 거리': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Xigang%2C_Dalian%2C_Liaoning%2C_China_-_panoramio_%2818%29.jpg/960px-Xigang%2C_Dalian%2C_Liaoning%2C_China_-_panoramio_%2818%29.jpg',
  ),
  '빈하이루 산책': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Xigang%2C_Dalian%2C_Liaoning%2C_China_-_panoramio_%2818%29.jpg/960px-Xigang%2C_Dalian%2C_Liaoning%2C_China_-_panoramio_%2818%29.jpg',
  ),
  '정저우 얼치광장': wm('Erqi Memorial Tower.jpg'),
  '한커우 숲': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Laika_ac_Mt._Paekdu_%287998657081%29.jpg/960px-Laika_ac_Mt._Paekdu_%287998657081%29.jpg',
  ),
  종루: wm('Bell Tower of Xi\'an.jpg'),
  회민가: wm('Muslim Quarter Xi\'an.jpg'),
  병마용: wm('Terracotta Army, Xi\'an.jpg'),
  화청지: wm('Huaqing Palace.jpg'),
  '시안 성벽': wm('Xi\'an City Wall.jpg'),
  대안탑: wm('Giant Wild Goose Pagoda.jpg'),
}

const CITY_PHOTO: Record<string, string> = {
  대련: BY_TITLE['싱하이 광장'],
  연태: BY_TITLE.펑라이각,
  청도: BY_TITLE.잔차오,
  하얼빈: BY_TITLE.중앙대가,
  북경: BY_TITLE.자금성,
  상하이: BY_TITLE.외탄,
  홍콩: BY_TITLE.빅토리아피크,
  백두산: BY_TITLE['백두산 천지'],
  서안: BY_TITLE.병마용,
  시안: BY_TITLE.병마용,
  청두: BY_TITLE['청두 판다기지'],
  태항산: BY_TITLE.태항대협곡,
  황산: BY_TITLE.황산,
  장가계: BY_TITLE.장가계,
  운남: BY_TITLE.석림,
  귀주: BY_TITLE['황과수 대폭포'],
}

function lookupTitle(title: string): string | undefined {
  if (BY_TITLE[title]) return BY_TITLE[title]
  const stripped = title.replace(/\s*(산책|당일|자전거|찻집|해안)$/u, '').trim()
  if (stripped && BY_TITLE[stripped]) return BY_TITLE[stripped]
  return undefined
}

function cityPhoto(place?: string): string | undefined {
  const city = (place || '').split(/[·,]/)[0].trim()
  return (city && CITY_PHOTO[city]) || undefined
}

const MEAL_KEYS: { keys: string[]; url: string }[] = [
  { keys: ['샤오롱바오', '난샹'], url: wm('Xiaolongbao.jpg') },
  { keys: ['카오야'], url: wm('Peking duck.jpg') },
  { keys: ['딤섬'], url: wm('Dim sum.jpg') },
  { keys: ['훠궈', '화궈', '마라'], url: wm('Hot pot.jpg') },
  { keys: ['양육파', '육협모'], url: wm('Roujiamo.jpg') },
  { keys: ['마파두부'], url: wm('Mapo tofu.jpg') },
  { keys: ['단단면'], url: wm('Dan dan noodles.jpg') },
  { keys: ['과교미선'], url: wm('Crossing-the-bridge noodles.jpg') },
  { keys: ['해산물', '해물', '생선'], url: wm('Chinese seafood.jpg') },
  { keys: ['만두'], url: wm('Jiaozi.jpg') },
  { keys: ['냉면'], url: wm('Naengmyeon.jpg') },
  { keys: ['맥주'], url: wm('Tsingtao beer.jpg') },
  { keys: ['와인'], url: wm('Red wine.jpg') },
  { keys: ['브런치', '카페'], url: wm('Brunch.jpg') },
  { keys: ['산채', '농가채', '소채', '산차이'], url: wm('Chinese vegetarian dish.jpg') },
  { keys: ['국수', '수타면', '새우면', '해물면', '면'], url: wm('Chinese noodles.jpg') },
  { keys: ['훠', '요리', '모둠', '코스', '정식', '석식', '안주'], url: wm('Chinese cuisine.jpg') },
]

const HOTEL_PHOTO = wm('Hotel room.jpg')
const HOTEL_KEYS: { keys: string[]; url: string }[] = [
  { keys: ['온천'], url: wm('Hot spring hotel.jpg') },
  { keys: ['객잔'], url: wm('Chinese courtyard inn.jpg') },
  { keys: ['산장'], url: wm('Mountain lodge.jpg') },
  { keys: ['호텔', '마리엇', '샹그릴라', '쉐라톤', '펜인슐라', '하버뷰'], url: HOTEL_PHOTO },
]

const TRANSPORT_BY_MODE: Record<string, string> = {
  train: wm('China Railway High-speed.jpg'),
  bus: wm('Airport bus.jpg'),
  ferry: wm('Star Ferry.jpg'),
  car: wm('China highway.jpg'),
  walk: wm('Pedestrian street China.jpg'),
  other: wm('Cable car.jpg'),
}

const TRANSPORT_KEYS: { keys: string[]; url: string }[] = [
  { keys: ['리무진', '공항'], url: wm('Airport bus.jpg') },
  { keys: ['기차'], url: wm('China Railway High-speed.jpg') },
  { keys: ['버스', '이동', '복귀'], url: wm('Coach bus China.jpg') },
  { keys: ['케이블'], url: wm('Cable car.jpg') },
  { keys: ['자전거'], url: wm('Bicycle.jpg') },
  { keys: ['엘리베이터'], url: wm('Bailong Elevator.jpg') },
]

const KIND_FALLBACK: Record<string, string> = {
  meal: wm('Chinese cuisine.jpg'),
  hotel: HOTEL_PHOTO,
  transport: wm('Airport bus.jpg'),
}

function matchKeys(text: string, groups: { keys: string[]; url: string }[]): string | undefined {
  for (const group of groups) {
    if (group.keys.some((key) => text.includes(key))) return group.url
  }
  return undefined
}

export const PHOTO_KINDS = ['sight', 'meal', 'hotel', 'transport'] as const

export function hasItemPhoto(kind?: string): boolean {
  return kind === 'sight' || kind === 'meal' || kind === 'hotel' || kind === 'transport'
}

export function resolveItemPhoto(
  item: {
    kind?: string
    title?: string
    photo?: string
    photoId?: string
    place?: string
    transportMode?: string
  },
  destination?: string,
  photos?: GalleryPhoto[],
): string | undefined {
  const photoId = item.photoId?.trim()
  if (photoId) {
    const fromGallery = photos?.find((row) => row.id === photoId)?.src || CATALOG.find((row) => row.id === photoId)?.src
    if (fromGallery) return fromGallery
  }
  const custom = item.photo?.trim()
  if (custom) return custom
  const title = (item.title || '').trim()
  const hay = `${title} ${item.place || ''}`
  if (title) {
    const exact = lookupTitle(title)
    if (exact) return exact
    for (const part of title.split(/[·,]/).map((bit) => bit.trim()).filter(Boolean)) {
      const found = lookupTitle(part)
      if (found) return found
    }
    for (const [key, url] of Object.entries(BY_TITLE)) {
      if (title.includes(key)) return url
    }
  }
  if (item.kind === 'meal') {
    return matchKeys(hay, MEAL_KEYS) || KIND_FALLBACK.meal
  }
  if (item.kind === 'hotel') {
    return matchKeys(hay, HOTEL_KEYS) || KIND_FALLBACK.hotel
  }
  if (item.kind === 'transport') {
    return (
      matchKeys(hay, TRANSPORT_KEYS) ||
      (item.transportMode ? TRANSPORT_BY_MODE[item.transportMode] : undefined) ||
      KIND_FALLBACK.transport
    )
  }
  return cityPhoto(destination) || cityPhoto(item.place)
}

export function resolveSightPhoto(
  item: { title?: string; photo?: string; place?: string; kind?: string; transportMode?: string },
  destination?: string,
): string | undefined {
  return resolveItemPhoto({ ...item, kind: item.kind ?? 'sight' }, destination)
}
