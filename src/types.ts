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
}

export type SampleRecord = {
  id: string
  sort: number
  nights: number
  place: string
  title: string
  destination: string
  trip: Trip
}

export type User = {
  id: string
  email: string
  name: string
  role?: 'user' | 'supervisor'
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
