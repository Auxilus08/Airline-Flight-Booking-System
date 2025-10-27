"use client"

import type { Seat } from "@/types/booking"
import { SeatMap } from "./seat-map"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SeatSelectionStepProps {
  selectedSeats: Seat[]
  onToggleSeat: (seat: Seat) => void
  onNext: () => void
  onPrevious: () => void
}

// Mock seat data
const MOCK_SEATS: Seat[] = [
  // Business Class
  ...Array.from({ length: 24 }, (_, i) => ({
    id: `B${i + 1}`,
    seatNumber: `${String.fromCharCode(65 + (i % 4))}${Math.floor(i / 4) + 1}`,
    section: "business" as const,
    isAvailable: Math.random() > 0.3,
    isSelected: false,
    price: 500,
  })),
  // Economy Class
  ...Array.from({ length: 120 }, (_, i) => ({
    id: `E${i + 1}`,
    seatNumber: `${String.fromCharCode(65 + (i % 6))}${Math.floor(i / 6) + 1}`,
    section: "economy" as const,
    isAvailable: Math.random() > 0.2,
    isSelected: false,
    price: 200,
  })),
]

export function SeatSelectionStep({ selectedSeats, onToggleSeat, onNext, onPrevious }: SeatSelectionStepProps) {
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)

  return (
    <div className="space-y-6">
      <SeatMap seats={MOCK_SEATS} selectedSeats={selectedSeats} onToggleSeat={onToggleSeat} />

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
