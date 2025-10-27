"use client"

import { useState } from "react"
import type { BookingState } from "@/types/booking"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface ReviewBookingStepProps {
  bookingState: BookingState
  onNext: () => void
  onPrevious: () => void
}

export function ReviewBookingStep({ bookingState, onNext, onPrevious }: ReviewBookingStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const router = useRouter()

  const baseFare = bookingState.selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  const taxes = Math.round(baseFare * 0.12 * 100) / 100
  const fees = 25
  const total = baseFare + taxes + fees

  const handleProceedToPayment = () => {
    if (termsAccepted) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Flight Details */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Flight Details</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Flight Number</p>
            <p className="font-medium">FL123</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Departure</p>
            <p className="font-medium">10:30 AM</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Arrival</p>
            <p className="font-medium">2:45 PM</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">4h 15m</p>
          </div>
        </div>
      </Card>

      {/* Passenger Details */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Passengers ({bookingState.passengers.length})</h3>
        <div className="space-y-3">
          {bookingState.passengers.map((passenger) => (
            <div key={passenger.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div>
                <p className="font-medium">
                  {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-muted-foreground">Passport: {passenger.passportNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{passenger.email}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Seat Assignments */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Seat Assignments</h3>
        <div className="flex flex-wrap gap-2">
          {bookingState.selectedSeats.map((seat) => (
            <div key={seat.id} className="rounded bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
              {seat.seatNumber}
            </div>
          ))}
        </div>
      </Card>

      {/* Price Breakdown */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Price Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Fare</span>
            <span>${baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes (12%)</span>
            <span>${taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Fee</span>
            <span>${fees.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span className="text-lg text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Terms & Conditions */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          />
          <Label htmlFor="terms" className="cursor-pointer text-sm">
            I agree to the terms and conditions and cancellation policy
          </Label>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3 pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleProceedToPayment} disabled={!termsAccepted}>
          Proceed to Payment
        </Button>
      </div>
    </div>
  )
}
