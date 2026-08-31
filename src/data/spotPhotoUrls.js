import { GALLERY_PHOTOS } from './galleryCatalog.js'
import { cityGalleryId } from './galleryCatalog.js'
import { SPOT_PHOTO_SRC } from './spotPhotoById.js'

function clean(url) {
  return String(url || '').split('?')[0]
}

function wm(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`
}

const BY_TITLE = {
  자금성: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/The_Forbidden_City_-_View_from_Coal_Hill.jpg/960px-The_Forbidden_City_-_View_from_Coal_Hill.jpg',
  ),
  천안문: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Tiananmen_Square_%2854137047250%29.jpg/960px-Tiananmen_Square_%2854137047250%29.jpg',
  ),
  '천안문 광장': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Tiananmen_Square_%2854137047250%29.jpg/960px-Tiananmen_Square_%2854137047250%29.jpg',
  ),
  '만리장성 무티엔위': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Great_Wall_of_China_July_2006.JPG/960px-Great_Wall_of_China_July_2006.JPG',
  ),
  만리장성: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Great_Wall_of_China_July_2006.JPG/960px-Great_Wall_of_China_July_2006.JPG',
  ),
  이화원: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Longevity_Hill_of_the_Summer_Palace.jpg/960px-Longevity_Hill_of_the_Summer_Palace.jpg',
  ),
  '798 예술구': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Beijing_798_Art_District.jpg/960px-Beijing_798_Art_District.jpg',
  ),
  '798': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Beijing_798_Art_District.jpg/960px-Beijing_798_Art_District.jpg',
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
  스탠리: wm('Stanley, Hong Kong.jpg'),
  템플스트리트: wm('Temple Street Night Market.jpg'),
  스타페리: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tsim_Sha_Tsui_Ferry_Pier.jpg/960px-Tsim_Sha_Tsui_Ferry_Pier.jpg',
  ),
  '백두산 천지': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/%E4%BB%8E%E9%95%BF%E7%99%BD%E5%B1%B1%E8%A5%BF%E5%9D%A1%E7%9C%8B%E5%A4%A9%E6%B1%A0-2017-08-24_1.jpg/960px-%E4%BB%8E%E9%95%BF%E7%99%BD%E5%B1%B1%E8%A5%BF%E5%9D%A1%E7%9C%8B%E5%A4%A9%E6%B1%A0-2017-08-24_1.jpg',
  ),
  천지: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/%E4%BB%8E%E9%95%BF%E7%99%BD%E5%B1%B1%E8%A5%BF%E5%9D%A1%E7%9C%8B%E5%A4%A9%E6%B1%A0-2017-08-24_1.jpg/960px-%E4%BB%8E%E9%95%BF%E7%99%BD%E5%B1%B1%E8%A5%BF%E5%9D%A1%E7%9C%8B%E5%A4%A9%E6%B1%A0-2017-08-24_1.jpg',
  ),
  '창바이 폭포': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Laika_ac_Mt._Paekdu_%287998657081%29.jpg/960px-Laika_ac_Mt._Paekdu_%287998657081%29.jpg',
  ),
  쿠안자이샹즈: wm('Wide and Narrow Alley.jpg'),
  '청두 판다기지': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Chengdu_Research_Base_Eingang.jpg/960px-Chengdu_Research_Base_Eingang.jpg',
  ),
  판다기지: clean(
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
  태항대협곡: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/%E5%A4%AA%E8%A1%8C%E5%B1%B1%E9%B3%A5%E7%9E%B0_%28%E6%B2%B3%E5%8D%97%E8%BC%9D%E7%B8%A3%29.jpg/960px-%E5%A4%AA%E8%A1%8C%E5%B1%B1%E9%B3%A5%E7%9E%B0_%28%E6%B2%B3%E5%8D%97%E8%BC%9D%E7%B8%A3%29.jpg',
  ),
  황산: clean('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Huangshan_pic_4.jpg/960px-Huangshan_pic_4.jpg'),
  훙춘: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Yixian_Hongcun_2016.09.09_17-27-03.jpg/960px-Yixian_Hongcun_2016.09.09_17-27-03.jpg',
  ),
  천문산: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Tianmen_38330-Zhangjiajie_%2849047525877%29.jpg/960px-Tianmen_38330-Zhangjiajie_%2849047525877%29.jpg',
  ),
  장가계: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg/960px-1_tianzishan_wulingyuan_zhangjiajie_2012.jpg',
  ),
  백룡엘리베이터: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/%E6%B9%96%E5%8D%97_%E5%BC%A0%E5%AE%B6%E7%95%8C_%E7%99%BE%E9%BE%99%E5%A4%A9%E6%A2%AF_-_panoramio.jpg/960px-%E6%B9%96%E5%8D%97_%E5%BC%A0%E5%AE%B6%E7%95%8C_%E7%99%BE%E9%BE%99%E5%A4%A9%E6%A2%AF_-_panoramio.jpg',
  ),
  석림: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Shilin%2C_Yunnan_24740.jpg/960px-Shilin%2C_Yunnan_24740.jpg',
  ),
  '리장 고성': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Lijiang_-_panoramio_%286%29.jpg/960px-Lijiang_-_panoramio_%286%29.jpg',
  ),
  '황과수 대폭포': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/%E9%BB%84%E6%9E%9C%E6%A0%91%E7%80%91%E5%B8%83_2026-07-31_01.jpg/960px-%E9%BB%84%E6%9E%9C%E6%A0%91%E7%80%91%E5%B8%83_2026-07-31_01.jpg',
  ),
  황과수: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/%E9%BB%84%E6%9E%9C%E6%A0%91%E7%80%91%E5%B8%83_2026-07-31_01.jpg/960px-%E9%BB%84%E6%9E%9C%E6%A0%91%E7%80%91%E5%B8%83_2026-07-31_01.jpg',
  ),
  샤오치콩: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Xiaoqikong.JPG/960px-Xiaoqikong.JPG',
  ),
  잔차오: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg/960px-Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg',
  ),
  라오산: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/20240730_Dabiao_Mountain_of_Mount_Lao_01.jpg/960px-20240730_Dabiao_Mountain_of_Mount_Lao_01.jpg',
  ),
  펑라이각: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Penglai_Pavilion_viewed_from_the_southeast.jpg/960px-Penglai_Pavilion_viewed_from_the_southeast.jpg',
  ),
  '성 소피아 성당': clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/West_facade_of_St._Sophia_Cathedral%2C_Harbin_%2820230721150450%29.jpg/960px-West_facade_of_St._Sophia_Cathedral%2C_Harbin_%2820230721150450%29.jpg',
  ),
  소피아성당: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/West_facade_of_St._Sophia_Cathedral%2C_Harbin_%2820230721150450%29.jpg/960px-West_facade_of_St._Sophia_Cathedral%2C_Harbin_%2820230721150450%29.jpg',
  ),
  중앙대가: clean(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Central_Street%2C_Harbin_16.jpg/960px-Central_Street%2C_Harbin_16.jpg',
  ),
  '싱하이 광장': wm('Xinghai Square Dalian.jpg'),
  싱하이광장: wm('Xinghai Square Dalian.jpg'),
  후탄: wm('Dalian Binhai Road.jpg'),
  동산관: wm('Donggang District Dalian.jpg'),
  병마용: wm('Terracotta Army, Xi\'an.jpg'),
  종루: wm('Bell Tower of Xi\'an.jpg'),
  회민가: wm('Muslim Quarter Xi\'an.jpg'),
  대안탑: wm('Giant Wild Goose Pagoda.jpg'),
  화청지: wm('Huaqing Palace.jpg'),
  '시안 성벽': wm('Xi\'an City Wall.jpg'),
  북해공원: wm('Beihai Park Beijing.jpg'),
  천단: wm('Temple of Heaven Beijing.jpg'),
  원mingyuan: wm('Old Summer Palace Beijing.jpg'),
  후퉁: wm('Hutong Beijing.jpg'),
  왕부정: wm('Wangfujing Beijing.jpg'),
  예원: wm('Yu Garden Shanghai.jpg'),
  신천지: wm('Xintiandi Shanghai.jpg'),
  황pu강: wm('The Bund at night.jpg'),
  프랑스조계: wm('Shanghai French Concession.jpg'),
  디즈니: wm('Shanghai Disneyland.jpg'),
  오션공원: wm('Ocean Park Hong Kong.jpg'),
  홍콩공원: wm('Hong Kong Park.jpg'),
}

const CITY_SRC = Object.fromEntries(GALLERY_PHOTOS.map((row) => [row.id, row.src]))

const PLACE_CITY = {
  대련: 'dalian',
  연태: 'yantai',
  청도: 'qingdao',
  하얼빈: 'harbin',
  북경: 'beijing',
  상하이: 'shanghai',
  홍콩: 'hongkong',
  백두산: 'baekdusan',
  서안: 'xian',
  청두: 'chengdu',
  태항산: 'taihang',
  황산: 'huangshan',
  장가계: 'zhangjiajie',
  운남: 'yunnan',
  귀주: 'guizhou',
}

const SPOT_ALIASES = {
  '798': '798',
  천안문: '천안문',
  만리장성: '만리장성',
  천지: '천지',
  황과수: '황과수',
  판다기지: '판다기지',
  소피아성당: '성 소피아 성당',
}

function lookupTitle(title) {
  const key = SPOT_ALIASES[title] || title
  if (BY_TITLE[key]) return BY_TITLE[key]
  const stripped = String(title).replace(/\s*(산책|당일|자전거|찻집|해안)$/u, '').trim()
  if (stripped && BY_TITLE[stripped]) return BY_TITLE[stripped]
  for (const [bit, url] of Object.entries(BY_TITLE)) {
    if (title.includes(bit) || bit.includes(title)) return url
  }
  return undefined
}

export function citySampleSrc(cityIdOrSlug, placeLabel) {
  const slug = cityGalleryId(cityIdOrSlug) || PLACE_CITY[placeLabel] || 'shanghai'
  return CITY_SRC[slug] || CITY_SRC.shanghai
}

export function resolveSpotPhotoUrl(name, cityId, placeLabel, spotId) {
  if (spotId && SPOT_PHOTO_SRC[spotId]) return SPOT_PHOTO_SRC[spotId]
  const title = String(name || '').trim()
  if (!title) return citySampleSrc(cityId, placeLabel)
  const exact = lookupTitle(title)
  if (exact) return exact
  for (const part of title.split(/[·,/]/).map((bit) => bit.trim()).filter(Boolean)) {
    const found = lookupTitle(part)
    if (found) return found
  }
  return citySampleSrc(cityId, placeLabel)
}
