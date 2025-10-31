"use client"

import { useState, useEffect } from "react"
import type { Flight, SearchFilters } from "@/types/flight"
import api from "@/lib/api"

// Helper function to format duration from minutes to "Xh Ym" format
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Helper function to format time from ISO timestamp
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

export function useFlightSearch(filters: SearchFilters & { from?: string; to?: string; date?: string }) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFlights() {
      // Skip if no search parameters
      if (!filters.from || !filters.to) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response: any = await api.flights.search({
          from: filters.from,
          to: filters.to,
          date: filters.date,
        })
        
        // Transform backend data to frontend format
        const transformedFlights: Flight[] = response.data.map((flight: any) => ({
          id: flight.FLIGHT_ID?.toString() || flight.flight_id?.toString(),
          airline: flight.AIRLINE_NAME || flight.airline_name || 'Unknown Airline',
          flightNumber: flight.FLIGHT_NUMBER || flight.flight_number,
          departureCode: flight.ORIGIN_CODE || flight.origin_code,
          departureCity: flight.ORIGIN_CITY || flight.origin_city,
          departureTime: formatTime(flight.DEPARTURE_TIME || flight.departure_time),
          arrivalCode: flight.DESTINATION_CODE || flight.destination_code,
          arrivalCity: flight.DESTINATION_CITY || flight.destination_city,
          arrivalTime: formatTime(flight.ARRIVAL_TIME || flight.arrival_time),
          duration: formatDuration(flight.DURATION_MINUTES || flight.duration_minutes),
          stops: 0, // Backend doesn't track stops yet
          price: parseFloat(flight.PRICE || flight.price || 0),
          seatsAvailable: parseInt(flight.AVAILABLE_SEATS || flight.available_seats || 0),
        }))
        
        setFlights(transformedFlights)
      } catch (err: any) {
        console.error('Failed to fetch flights:', err)
        setError(err.message || 'Failed to load flights')
        setFlights([])
      } finally {
        setLoading(false)
      }
    }

    fetchFlights()
  }, [filters.from, filters.to, filters.date])

  return { flights, loading, error }
}
