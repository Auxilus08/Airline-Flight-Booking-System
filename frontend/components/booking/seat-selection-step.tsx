"use client"

import { useState, useEffect } from "react"
import type { Seat } from "@/types/booking"
import { SeatMap } from "./seat-map"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// import { api } from "@/lib/api"

interface SeatSelectionStepProps {
  selectedSeats: Seat[]
  onToggleSeat: (seat: Seat) => void
  onNext: () => void
  onPrevious: () => void
  flightId?: string // Flight ID to fetch seat availability
}

// TODO: Fetch seat availability from backend API
// Example usage:
// useEffect(() => {
//   const fetchSeats = async () => {
//     if (!flightId) return
//     try {
//       const data = await api.flights.getSeats(flightId)
//       setSeats(data)
//     } catch (error) {
//       console.error("Error fetching seats:", error)
//     }
//   }
//   fetchSeats()
// }, [flightId])

export function SeatSelectionStep({ selectedSeats, onToggleSeat, onNext, onPrevious, flightId }: SeatSelectionStepProps) {
  const [seats, setSeats] = useState<Seat[]>([])
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)

  return (
    <div className="space-y-6">
      <SeatMap seats={seats} selectedSeats={selectedSeats} onToggleSeat={onToggleSeat} />

      {selectedSeats.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selected Seats</p>
              <p className="font-semibold">
                {selectedSeats.map((s) => s.seatNumber).join(", ")} - ${totalPrice}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between gap-3 pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={onNext} disabled={selectedSeats.length === 0}>
          Next: Review Booking
        </Button>
      </div>
    </div>
  )
}
