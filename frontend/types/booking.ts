export interface Passenger {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  passportNumber: string
  email: string
  phone: string
}

export interface Seat {
  id: string
  seatNumber: string
  section: "economy" | "business"
  isAvailable: boolean
  isSelected: boolean
  price: number
}

export interface BookingState {
  flightId: string
  passengers: Passenger[]
  selectedSeats: Seat[]
  paymentMethod: "credit-card" | "debit-card" | "upi"
  cardDetails?: {
    cardNumber: string
    cardholderName: string
    expiryDate: string
    cvv: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  termsAccepted: boolean
  bookingReference?: string
}

export interface PriceBreakdown {
  baseFare: number
  taxes: number
  fees: number
  total: number
}

export interface BookingStep {
  id: number
  title: string
  description: string
}
