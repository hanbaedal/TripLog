export type ItemKind = 'flight' | 'hotel' | 'meal' | 'sight' | 'transport'

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'latenight'

export type TransportMode = 'train' | 'bus' | 'ferry' | 'car' | 'walk' | 'other'

export type FlightFields = {
  departTerminal?: string
  destination?: string
  arriveTime?: string
  arriveTerminal?: string
  flightNo?: string
  airline?: string
}

export type TripItem = {
  id: string
  dayIndex: number
  time: string
  kind: ItemKind
  title: string
  subtitle?: string
  place?: string
  note?: string
  photo?: string
  photoId?: string
  cost: number
  mealSlot?: MealSlot
  transportMode?: TransportMode
  source?: 'manual' | 'connect'
  flight?: FlightFields
}

export type Trip = {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  adults: number
  children: number
  items: TripItem[]
  updatedAt?: string
  savedByUser?: boolean
  publishedSampleId?: string
}

export type SampleRecord = {
  id: string
  sort: number
  nights: number
  place: string
  title: string
  destination: string
  trip: Trip
  ownerId?: string
  ownerName?: string
  sourceTripId?: string
}

export type User = {
  id: string
  email: string
  name: string
  phone?: string
  role?: 'user' | 'supervisor'
}

export type GalleryCategory = 'sight' | 'meal' | 'hotel' | 'transport' | 'flight'

export type SightType = 'mountain' | 'lake' | 'beach' | 'palace' | 'temple' | 'town' | 'park'

export type FoodType =
  | 'beijingkaoya'
  | 'mapodoufu'
  | 'gongbaojiding'
  | 'tangculiji'
  | 'huoguo'
  | 'jiaozi'
  | 'xiaolongbao'
  | 'chaofan'
  | 'chunjuan'
  | 'lamian'
  | string

export type GalleryPhoto = {
  id: string
  title: string
  src: string
  city?: string
  category?: GalleryCategory
  sightType?: SightType
  ownerId?: string
  ownerName?: string
  at?: string
  catalog?: boolean
}

export type BoardComment = {
  id: string
  name: string
  body: string
  at: string
  ownerId?: string
}

export type BoardPost = {
  id: string
  name: string
  title: string
  body: string
  at: string
  ownerId?: string
  comments?: BoardComment[]
}

export type TravelInfo = {
  id: string
  place: string
  title: string
  body: string
  photoId?: string
  src?: string
  sort?: number
  catalog?: boolean
  ownerId?: string
  ownerName?: string
  at?: string
}

export type TravelSpot = {
  id: string
  cityId: string
  name: string
  nameZh?: string
  addressZh?: string
  body: string
  tip: string
  photoId?: string
  src?: string
  sort?: number
  catalog?: boolean
  ownerId?: string
  ownerName?: string
  at?: string
}

export type Inquiry = {
  id: string
  name: string
  email: string
  message: string
  at: string
  ownerId?: string
  reply?: string
  replyAt?: string
}

export type FlightOffer = {
  id: string
  airline: string
  airlineCode: string
  flightNo: string
  from: string
  to: string
  fromCity: string
  toCity: string
  date: string
  depart: string
  arrive: string
  plusDay: number
  duration: string
  stops: number
  cabin: string
  price: number
  seats: number
  detail?: string
  terminal?: string
}

export type HotelOffer = {
  id: string
  name: string
  city: string
  area: string
  stars: number
  nightly: number
  rating: number
  amenities: string[]
}
