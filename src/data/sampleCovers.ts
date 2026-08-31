const BY_ID: Record<string, string> = {
  dalian: '/samples/dalian.jpg',
  yantai: '/samples/yantai.jpg',
  qingdao: '/samples/qingdao.jpg',
  harbin: '/samples/harbin.jpg',
  beijing: '/samples/beijing.jpg',
  shanghai: '/samples/shanghai.jpg',
  hongkong: '/samples/hongkong.jpg',
  baekdusan: '/samples/baekdusan.jpg',
  xian: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent("Terracotta Army.jpg")}?width=960`,
  chengdu: '/samples/chengdu.jpg',
  taihang: '/samples/taihang.jpg',
  huangshan: '/samples/huangshan.jpg',
  zhangjiajie: '/samples/zhangjiajie.jpg',
  yunnan: '/samples/yunnan.jpg',
  guizhou: '/samples/guizhou.jpg',
}

const BY_PLACE: Record<string, string> = {
  대련: BY_ID.dalian,
  연태: BY_ID.yantai,
  청도: BY_ID.qingdao,
  하얼빈: BY_ID.harbin,
  북경: BY_ID.beijing,
  상하이: BY_ID.shanghai,
  홍콩: BY_ID.hongkong,
  백두산: BY_ID.baekdusan,
  서안: BY_ID.xian,
  시안: BY_ID.xian,
  청두: BY_ID.chengdu,
  태항산: BY_ID.taihang,
  황산: BY_ID.huangshan,
  장가계: BY_ID.zhangjiajie,
  운남: BY_ID.yunnan,
  귀주: BY_ID.guizhou,
}

export function sampleCover(sample: { id?: string; place?: string }): string {
  const id = (sample.id || '').trim()
  if (id && BY_ID[id]) return BY_ID[id]
  const place = (sample.place || '').split(/[·,]/)[0].trim()
  if (place && BY_PLACE[place]) return BY_PLACE[place]
  return BY_ID.shanghai
}
