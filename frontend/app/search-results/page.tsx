"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { SearchResultsHeader } from "@/components/search-results/search-results-header"
import { FilterSidebar } from "@/components/search-results/filter-sidebar"
import { FlightCard } from "@/components/search-results/flight-card"
import { LoadingState } from "@/components/search-results/loading-state"
import { EmptyState } from "@/components/search-results/empty-state"
import { useFlightSearch } from "@/hooks/use-flight-search"
import type { Flight, SearchFilters } from "@/types/flight"

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  
  // Get search parameters from URL
  const from = searchParams?.get("from") || ""
  const to = searchParams?.get("to") || ""
  const date = searchParams?.get("date") || ""
  
  const [filters, setFilters] = useState<SearchFilters & { from?: string; to?: string; date?: string }>({
    from,
    to,
    date,
    priceRange: [0, 5000],
    departureTime: [],
    airlines: [],
    stops: [],
    sortBy: "price-low-high",
  })

  // Update filters when URL params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      from: from || prev.from,
      to: to || prev.to,
      date: date || prev.date,
    }))
  }, [from, to, date])

  const { flights, loading, error } = useFlightSearch(filters)
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])

  useEffect(() => {
    let result = [...flights]

    // Apply filters
    if (filters.priceRange) {
      result = result.filter((flight) => flight.price >= filters.priceRange[0] && flight.price <= filters.priceRange[1])
    }

    if (filters.departureTime.length > 0) {
      result = result.filter((flight) => {
        const hour = Number.parseInt(flight.departureTime.split(":")[0])
        return filters.departureTime.some((time) => {
          if (time === "morning") return hour >= 6 && hour < 12
          if (time === "afternoon") return hour >= 12 && hour < 18
          if (time === "evening") return hour >= 18 && hour < 24
          if (time === "night") return hour >= 0 && hour < 6
          return false
        })
      })
    }

    if (filters.airlines.length > 0) {
      result = result.filter((flight) => filters.airlines.includes(flight.airline))
    }

    if (filters.stops.length > 0) {
      result = result.filter((flight) => filters.stops.includes(flight.stops.toString()))
    }

    // Apply sorting
    if (filters.sortBy === "price-low-high") {
      result.sort((a, b) => a.price - b.price)
    } else if (filters.sortBy === "price-high-low") {
      result.sort((a, b) => b.price - a.price)
    } else if (filters.sortBy === "duration") {
      result.sort((a, b) => {
        const aDuration = Number.parseInt(a.duration)
        const bDuration = Number.parseInt(b.duration)
        return aDuration - bDuration
      })
    } else if (filters.sortBy === "departure-time") {
      result.sort((a, b) => a.departureTime.localeCompare(b.departureTime))
    }

    setFilteredFlights(result)
  }, [flights, filters])

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            <p className="font-semibold">Error loading flights</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <SearchResultsHeader resultsCount={filteredFlights.length} />

        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          <FilterSidebar filters={filters} onFiltersChange={setFilters} />

          <div className="lg:col-span-3">
            {loading ? (
              <LoadingState />
            ) : filteredFlights.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
