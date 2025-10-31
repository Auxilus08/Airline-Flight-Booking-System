"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Plane, MapPin, Calendar, Users, Armchair } from "lucide-react"

interface SearchFormProps {
  origin?: string
  destination?: string
  departDate?: string
  returnDate?: string
  passengers?: number
  travelClass?: string
}

const AIRPORTS = [
  { code: "DEL", city: "New Delhi" },
  { code: "BOM", city: "Mumbai" },
  { code: "BLR", city: "Bengaluru" },
  { code: "HYD", city: "Hyderabad" },
  { code: "CCU", city: "Kolkata" },
  { code: "MAA", city: "Chennai" },
  { code: "AMD", city: "Ahmedabad" },
  { code: "COK", city: "Kochi" },
  { code: "GOI", city: "Goa" },
  { code: "PNQ", city: "Pune" },
]

const TRAVEL_CLASSES = ["Economy", "Business", "First"]

export function SearchForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<SearchFormProps>({
    origin: "",
    destination: "",
    departDate: "",
    returnDate: "",
    passengers: 1,
    travelClass: "Economy",
  })

  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.origin || !formData.destination || !formData.departDate) {
      alert("Please fill in all required fields: origin, destination, and departure date")
      return
    }
    
    // Build query parameters
    const params = new URLSearchParams({
      from: formData.origin,
      to: formData.destination,
      date: formData.departDate,
      passengers: formData.passengers.toString(),
      class: formData.travelClass,
    })
    
    // Navigate to search results page
    router.push(`/search-results?${params.toString()}`)
  }

  return (
    <section className="relative -mt-32 z-20 px-4 sm:px-6 lg:px-8 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="max-w-6xl mx-auto bg-white shadow-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 flex items-center gap-2">
            <Plane className="w-8 h-8 text-primary" />
            Find Your Flight
          </h2>

          <form onSubmit={handleSearch} className="space-y-6">
            {/* Trip Type Selection */}
            <div className="flex gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tripType" defaultChecked className="w-4 h-4" />
                <span className="text-foreground font-medium">Round Trip</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tripType" className="w-4 h-4" />
                <span className="text-foreground font-medium">One Way</span>
              </label>
            </div>

            {/* Main Search Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Origin */}
              <div className="relative">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  From
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Departure"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    onFocus={() => setShowOriginDropdown(true)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                  {showOriginDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50">
                      {AIRPORTS.map((airport) => (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, origin: airport.code })
                            setShowOriginDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted text-foreground"
                        >
                          {airport.code} - {airport.city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Destination */}
              <div className="relative">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  To
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Arrival"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    onFocus={() => setShowDestinationDropdown(true)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                  {showDestinationDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50">
                      {AIRPORTS.map((airport) => (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, destination: airport.code })
                            setShowDestinationDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted text-foreground"
                        >
                          {airport.code} - {airport.city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Departure Date */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Depart
                </label>
                <input
                  type="date"
                  value={formData.departDate}
                  onChange={(e) => setFormData({ ...formData, departDate: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Return
                </label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Passengers
                </label>
                <select
                  value={formData.passengers}
                  onChange={(e) => setFormData({ ...formData, passengers: Number.parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Passenger" : "Passengers"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Travel Class */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Armchair className="w-4 h-4 inline mr-1" />
                  Class
                </label>
                <select
                  value={formData.travelClass}
                  onChange={(e) => setFormData({ ...formData, travelClass: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  {TRAVEL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-12 py-3 rounded-full"
              >
                Search Flights
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </section>
  )
}
