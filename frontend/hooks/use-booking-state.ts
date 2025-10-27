"use client"

import { useState, useEffect } from "react"
import type { BookingState, Passenger, Seat } from "@/types/booking"

const STORAGE_KEY = "airline_booking_state"

export function useBookingState(flightId: string) {
  const [bookingState, setBookingState] = useState<BookingState>({
    flightId,
    passengers: [],
    selectedSeats: [],
    paymentMethod: "credit-card",
    termsAccepted: false,
  })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setBookingState(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load booking state:", error)
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingState))
  }, [bookingState])

  const addPassenger = (passenger: Passenger) => {
    setBookingState((prev) => ({
      ...prev,
      passengers: [...prev.passengers, passenger],
    }))
  }

  const updatePassenger = (id: string, passenger: Passenger) => {
    setBookingState((prev) => ({
      ...prev,
      passengers: prev.passengers.map((p) => (p.id === id ? passenger : p)),
    }))
  }

  const removePassenger = (id: string) => {
    setBookingState((prev) => ({
      ...prev,
      passengers: prev.passengers.filter((p) => p.id !== id),
    }))
  }

  const toggleSeat = (seat: Seat) => {
    setBookingState((prev) => {
      const isSelected = prev.selectedSeats.some((s) => s.id === seat.id)
      return {
        ...prev,
        selectedSeats: isSelected ? prev.selectedSeats.filter((s) => s.id !== seat.id) : [...prev.selectedSeats, seat],
      }
    })
  }

  const clearBooking = () => {
    setBookingState({
      flightId,
      passengers: [],
      selectedSeats: [],
      paymentMethod: "credit-card",
      termsAccepted: false,
    })
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    bookingState,
    setBookingState,
    addPassenger,
    updatePassenger,
    removePassenger,
    toggleSeat,
    clearBooking,
  }
}
