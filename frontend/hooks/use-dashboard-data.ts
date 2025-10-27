"use client"

import { useState, useCallback } from "react"
import type { Booking, UserProfile, PaymentRecord } from "@/types/dashboard"

// Mock data
const mockBookings: Booking[] = [
  {
    id: "1",
    bookingRef: "BK123456",
    flightNumber: "AI101",
    airline: "Air India",
    departure: {
      airport: "Indira Gandhi International",
      code: "DEL",
      time: "10:30 AM",
      date: "2024-12-15",
    },
    arrival: {
      airport: "Bombay International",
      code: "BOM",
      time: "12:45 PM",
      date: "2024-12-15",
    },
    passengers: ["John Doe", "Jane Doe"],
    seats: ["12A", "12B"],
    status: "confirmed",
    totalPrice: 15000,
    paymentMethod: "credit_card",
    paymentStatus: "completed",
    bookingDate: "2024-11-01",
  },
  {
    id: "2",
    bookingRef: "BK123457",
    flightNumber: "AI202",
    airline: "Air India",
    departure: {
      airport: "Bombay International",
      code: "BOM",
      time: "02:00 PM",
      date: "2024-12-20",
    },
    arrival: {
      airport: "Bangalore International",
      code: "BLR",
      time: "03:30 PM",
      date: "2024-12-20",
    },
    passengers: ["John Doe"],
    seats: ["5C"],
    status: "pending",
    totalPrice: 8000,
    paymentMethod: "upi",
    paymentStatus: "pending",
    bookingDate: "2024-11-05",
  },
  {
    id: "3",
    bookingRef: "BK123458",
    flightNumber: "AI303",
    airline: "Air India",
    departure: {
      airport: "Bangalore International",
      code: "BLR",
      time: "06:00 PM",
      date: "2024-11-10",
    },
    arrival: {
      airport: "Indira Gandhi International",
      code: "DEL",
      time: "08:15 PM",
      date: "2024-11-10",
    },
    passengers: ["John Doe"],
    seats: ["8A"],
    status: "cancelled",
    totalPrice: 7500,
    paymentMethod: "credit_card",
    paymentStatus: "completed",
    bookingDate: "2024-10-20",
  },
]

const mockUserProfile: UserProfile = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+91 98765 43210",
  dateOfBirth: "1990-05-15",
  nationality: "Indian",
  passportNumber: "A12345678",
  address: "123 Main Street",
  city: "New Delhi",
  state: "Delhi",
  zipCode: "110001",
  country: "India",
}

const mockPaymentRecords: PaymentRecord[] = [
  {
    id: "1",
    bookingRef: "BK123456",
    date: "2024-11-01",
    amount: 15000,
    method: "credit_card",
    status: "completed",
    transactionId: "TXN001",
  },
  {
    id: "2",
    bookingRef: "BK123457",
    date: "2024-11-05",
    amount: 8000,
    method: "upi",
    status: "pending",
    transactionId: "TXN002",
  },
  {
    id: "3",
    bookingRef: "BK123458",
    date: "2024-10-20",
    amount: 7500,
    method: "credit_card",
    status: "completed",
    transactionId: "TXN003",
  },
]

export function useDashboardData() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile)
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(mockPaymentRecords)

  const getUpcomingBookings = useCallback(() => {
    return bookings.filter((b) => b.status === "confirmed")
  }, [bookings])

  const getCompletedBookings = useCallback(() => {
    return bookings.filter((b) => b.status === "confirmed" && new Date(b.departure.date) < new Date())
  }, [bookings])

  const getCancelledBookings = useCallback(() => {
    return bookings.filter((b) => b.status === "cancelled")
  }, [bookings])

  const updateUserProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile)
  }, [])

  const cancelBooking = useCallback((bookingId: string) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b)))
  }, [])

  return {
    bookings,
    userProfile,
    paymentRecords,
    getUpcomingBookings,
    getCompletedBookings,
    getCancelledBookings,
    updateUserProfile,
    cancelBooking,
  }
}
