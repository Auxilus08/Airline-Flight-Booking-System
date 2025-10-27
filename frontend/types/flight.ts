export interface Flight {
  id: string
  airline: string
  flightNumber: string
  departureCode: string
  departureCity: string
  departureTime: string
  arrivalCode: string
  arrivalCity: string
  arrivalTime: string
  duration: string
  stops: number
  price: number
  seatsAvailable: number
}

export interface SearchFilters {
  priceRange: [number, number]
  departureTime: string[]
  airlines: string[]
  stops: string[]
  sortBy: string
}
