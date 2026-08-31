import type { Trip, TripItem } from '../types'
import { KIND_LABEL, MEAL_LABEL, TRANSPORT_LABEL, krw, summarize } from './costs'
import { dayCount, dateOn, formatLong, formatRange } from './dates'

export type GuideBlock = {
  kicker?: string
  title: string
  paragraphs: string[]
  rows?: { time?: string; label: string; detail: string; cost: string }[]
}

export type Guidebook = {
  cover: {
    brand: string
    title: string
    destination: string
    range: string
    people: string
    slogans: string[]
  }
  blocks: GuideBlock[]
}

function sortedDay(items: TripItem[], dayIndex: number): TripItem[] {
  return items
    .filter((item) => item.dayIndex === dayIndex)
    .sort((a, b) => a.time.localeCompare(b.time))
}

function itemDetail(item: TripItem): string {
  const bits: string[] = []
  if (item.kind === 'meal' && item.mealSlot) bits.push(MEAL_LABEL[item.mealSlot])
  if (item.kind === 'transport' && item.transportMode) {
    bits.push(TRANSPORT_LABEL[item.transportMode] ?? item.transportMode)
  }
  if (item.place) bits.push(item.place)
  if (item.subtitle) bits.push(item.subtitle)
  if (item.note) bits.push(item.note)
  return bits.join(' · ') || KIND_LABEL[item.kind]
}

function objectMarker(word: string): '을' | '를' {
  const ch = word.trim().slice(-1)
  if (!ch) return '을'
  const code = ch.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return '을'
  return (code - 0xac00) % 28 === 0 ? '를' : '을'
}

function dayParagraph(items: TripItem[]): string {
  if (items.length === 0) {
    return '이 날은 아직 비어 있습니다. 플래너에서 일정만 넣으면 안내서 문장이 자동으로 채워집니다.'
  }

  const chunks: string[] = []
  const flights = items.filter((i) => i.kind === 'flight')
  const hotels = items.filter((i) => i.kind === 'hotel')
  const meals = items.filter((i) => i.kind === 'meal')
  const sights = items.filter((i) => i.kind === 'sight')
  const moves = items.filter((i) => i.kind === 'transport')

  if (flights.length) {
    chunks.push(
      `항공은 ${flights.map((f) => `${f.time} ${f.title}`).join(', ')}입니다.`,
    )
  }
  if (moves.length) {
    chunks.push(
      `이동은 ${moves.map((m) => `${m.title}${m.place ? ` (${m.place})` : ''}`).join(', ')}로 이어집니다.`,
    )
  }
  if (sights.length) {
    const names = sights.map((s) => s.title).join(', ')
    chunks.push(`관광은 ${names}${objectMarker(names)} 중심으로 돕니다.`)
  }
  if (meals.length) {
    const mealText = meals
      .map((m) => {
        const slot = m.mealSlot ? MEAL_LABEL[m.mealSlot] : '식사'
        return `${slot} ${m.title}`
      })
      .join(', ')
    chunks.push(`식사는 ${mealText}입니다.`)
  }
  if (hotels.length) {
    chunks.push(`숙소는 ${hotels.map((h) => h.title).join(', ')}입니다.`)
  }

  return chunks.join(' ')
}

export function buildGuidebook(trip: Trip): Guidebook {
  const days = dayCount(trip.startDate, trip.endDate)
  const nights = days - 1
  const summary = summarize(trip)
  const peopleText = `성인 ${trip.adults}명${trip.children ? ` · 소아 ${trip.children}명` : ''} · 총 ${summary.people}명`

  const overview: string[] = [
    `${trip.destination || '여행지'} ${nights}박 ${days}일 일정입니다. ${peopleText} 기준으로 예상 비용은 합계 ${krw(summary.total)}, 1인당 ${krw(summary.perPerson)}입니다.`,
    '항공·호텔·끼니·관광·교통을 하루 타임라인에 모아 두면, 아래 안내서는 그 기록에서 바로 만들어집니다.',
  ]

  const flights = trip.items.filter((i) => i.kind === 'flight').sort((a, b) => a.dayIndex - b.dayIndex || a.time.localeCompare(b.time))
  const hotels = trip.items.filter((i) => i.kind === 'hotel')

  const blocks: GuideBlock[] = [
    {
      kicker: 'Overview',
      title: '여행 한눈에',
      paragraphs: overview,
    },
    {
      kicker: 'Flights',
      title: '항공',
      paragraphs: flights.length
        ? ['출도착 시간과 편명을 여정 카드에서 그대로 가져왔습니다.']
        : ['아직 항공 일정이 없습니다. 플래너에서 편명을 넣으면 이 칸이 채워집니다.'],
      rows: flights.map((f) => ({
        time: `${f.dayIndex + 1}일차 ${f.time}`,
        label: f.title,
        detail: itemDetail(f),
        cost: krw(f.cost),
      })),
    },
    {
      kicker: 'Stay',
      title: '호텔 · 숙소',
      paragraphs: hotels.length
        ? ['숙박은 Track My Stay — 머무는 곳을 일정에 붙여 밤마다 확인할 수 있습니다.']
        : ['숙소가 아직 없습니다. 체크인 정보를 넣으면 안내서에 주소와 비용이 함께 실립니다.'],
      rows: hotels.map((h) => ({
        time: `${h.dayIndex + 1}일차 ${h.time}`,
        label: h.title,
        detail: itemDetail(h),
        cost: krw(h.cost),
      })),
    },
  ]

  for (let i = 0; i < days; i++) {
    const items = sortedDay(trip.items, i)
    blocks.push({
      kicker: `Day ${i + 1}`,
      title: `${i + 1}일차 · ${formatLong(dateOn(trip.startDate, i))}`,
      paragraphs: [dayParagraph(items)],
      rows: items.map((item) => ({
        time: item.time,
        label: item.title,
        detail: itemDetail(item),
        cost: krw(item.cost),
      })),
    })
  }

  const mealRows = (['breakfast', 'lunch', 'dinner', 'latenight'] as const).map((slot) => ({
    label: MEAL_LABEL[slot],
    detail: '끼니별 합계',
    cost: krw(summary.byMeal[slot]),
  }))

  blocks.push({
    kicker: 'Meals',
    title: '식사 계획 (조·중·석·야)',
    paragraphs: ['아침부터 밤 간식까지 네 끼를 나눠 적으면, 맛집만 따로 엑셀에 적지 않아도 됩니다.'],
    rows: mealRows,
  })

  const kindRows = (['flight', 'hotel', 'meal', 'sight', 'transport'] as const).map((kind) => ({
    label: KIND_LABEL[kind],
    detail: '카테고리 합계',
    cost: krw(summary.byKind[kind]),
  }))

  blocks.push({
    kicker: 'Budget',
    title: '예상 비용',
    paragraphs: [
      `총 ${krw(summary.total)} · 1인 ${krw(summary.perPerson)} · 하루 평균 ${krw(summary.perDay)}.`,
      '금액은 항목을 넣을 때마다 다시 계산됩니다. 실제 결제액이 아니라 여행 전 가늠용입니다.',
    ],
    rows: kindRows,
  })

  blocks.push({
    kicker: 'Notes',
    title: '챙길 것',
    paragraphs: [
      '여권, 항공 모바일 보딩패스, 숙소 바우처, 교통패스, 충전기, 상비약, 여행자보험 증서를 출발 전날 한 번 더 확인하세요.',
      '현지에서 일정이 바뀌면 플래너만 고치면 이 안내서도 다시 만들 수 있습니다.',
    ],
  })

  return {
    cover: {
      brand: 'triplog.my',
      title: trip.title,
      destination: trip.destination || '나만의 여행',
      range: formatRange(trip.startDate, trip.endDate),
      people: peopleText,
      slogans: [
        'Map My Journey, Track My Stay.',
        '我的专属旅行足迹。',
        '나의 여정을 그리고, 숙소를 기록하다.',
      ],
    },
    blocks,
  }
}
