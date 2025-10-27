"use client"

import type { Seat } from "@/types/booking"
import { Card } from "@/components/ui/card"

interface SeatMapProps {
  seats: Seat[]
  selectedSeats: Seat[]
  onToggleSeat: (seat: Seat) => void
}

export function SeatMap({ seats, selectedSeats, onToggleSeat }: SeatMapProps) {
  const economySeats = seats.filter((s) => s.section === "economy")
  const businessSeats = seats.filter((s) => s.section === "business")

  const renderSeatGrid = (sectionSeats: Seat[], sectionTitle: string) => {
    const rows = Math.ceil(sectionSeats.length / 6)
    const seatGrid = Array.from({ length: rows }, (_, i) => sectionSeats.slice(i * 6, (i + 1) * 6))

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">{sectionTitle}</h3>
        <div className="space-y-2">
          {seatGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-2">
              {row.map((seat) => {
                const isSelected = selectedSeats.some((s) => s.id === seat.id)
                return (
                  <button
                    key={seat.id}
                    onClick={() => onToggleSeat(seat)}
                    disabled={!seat.isAvailable && !isSelected}
                    className={`h-10 w-10 rounded border-2 font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : seat.isAvailable
                          ? "border-border bg-background hover:border-primary hover:bg-secondary"
                          : "border-muted bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {seat.seatNumber}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded border-2 border-border bg-background" />
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded border-2 border-primary bg-primary" />
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded border-2 border-muted bg-muted" />
          <span className="text-sm">Occupied</span>
        </div>
      </div>

      <div className="space-y-8">
        {renderSeatGrid(businessSeats, "Business Class")}
        <div className="border-t pt-8" />
        {renderSeatGrid(economySeats, "Economy Class")}
      </div>
    </Card>
  )
}
