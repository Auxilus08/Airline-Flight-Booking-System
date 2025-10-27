"use client"

import { useState, useEffect } from "react"
import type { Flight, SearchFilters } from "@/types/flight"

// Mock API - replace with real API call
const mockFlights: Flight[] = [
  {
    id: "1",
    airline: "United Airlines",
    flightNumber: "UA123",
    departureCode: "LAX",
    departureCity: "Los Angeles",
    departureTime: "08:00",
    arrivalCode: "JFK",
    arrivalCity: "New York",
    arrivalTime: "16:30",
    duration: "5h 30m",
    stops: 0,
    price: 245,
    seatsAvailable: 8,
  },
  {
    id: "2",
    airline: "Delta",
    flightNumber: "DL456",
    departureCode: "LAX",
    departureCity: "Los Angeles",
    departureTime: "10:15",
    arrivalCode: "JFK",
    arrivalCity: "New York",
    arrivalTime: "18:45",
    duration: "5h 30m",
    stops: 0,
    price: 289,
    seatsAvailable: 3,
  },
  {
    id: "3",
    airline: "American Airlines",
    flightNumber: "AA789",
    departureCode: "LAX",
    departureCity: "Los Angeles",
    departureTime: "14:00",
    arrivalCode: "JFK",
    arrivalCity: "New York",
    arrivalTime: "22:15",
    duration: "5h 15m",
    stops: 0,
    price: 199,
    seatsAvailable: 12,
  },
  {
    id: "4",
    airline: "Southwest",
    flightNumber: "SW234",
    departureCode: "LAX",
    departureCity: "Los Angeles",
    departureTime: "06:30",
    arrivalCode: "JFK",
    arrivalCity: "New York",
    arrivalTime: "14:45",
    duration: "5h 15m",
    stops: 0,
    price: 219,
    seatsAvailable: 15,
  },
  {
    id: "5",
    airline: "United Airlines",
    flightNumber: "UA567",
    departureCode: "LAX",
    departureCity: "Los Angeles",
    departureTime: "12:00",
    arrivalCode: "JFK",
    arrivalCity: "New York",
    arrivalTime: "20:30",
    duration: "5h 30m",
    stops: 1,
    price: 159,
    seatsAvailable: 6,
  },
  {
    id: "6",
    airline: "Delta",
    flightNumber: "DL890",
    departureCode: "LAX",
    departureCity: "Los Angeles",
    departureTime: "18:45",
    arrivalCode: "JFK",
    arrivalCity: "New York",
    arrivalTime: "03:15",
    duration: "6h 30m",
    stops: 1,
    price: 139,
    seatsAvailable: 9,
  },
]

export function useFlightSearch(filters: SearchFilters) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      try {
        setFlights(mockFlights)
        setLoading(false)
      } catch (err) {
        setError("Failed to load flights")
        setLoading(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [filters])

  return { flights, loading, error }
}
