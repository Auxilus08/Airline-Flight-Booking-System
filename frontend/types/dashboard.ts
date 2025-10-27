export interface Booking {
  id: string
  bookingRef: string
  flightNumber: string
  airline: string
  departure: {
    airport: string
    code: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    code: string
    time: string
    date: string
  }
  passengers: string[]
  seats: string[]
  status: "confirmed" | "pending" | "cancelled"
  totalPrice: number
  paymentMethod: string
  paymentStatus: "completed" | "pending" | "failed"
  bookingDate: string
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface SavedPassenger {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
  type: "adult" | "child" | "infant"
}

export interface PaymentRecord {
  id: string
  bookingRef: string
  date: string
  amount: number
  method: "credit_card" | "debit_card" | "upi"
  status: "completed" | "pending" | "failed"
  transactionId: string
}

export interface TravelPreference {
  seatPreference: "window" | "aisle" | "middle" | "any"
  mealPreference: string
  specialAssistance: string
}
