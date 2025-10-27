"use client"

import { useState } from "react"
import type { BookingStep } from "@/types/booking"
import { useBookingState } from "@/hooks/use-booking-state"
import { BookingStepper } from "@/components/booking/booking-stepper"
import { PassengerDetailsStep } from "@/components/booking/passenger-details-step"
import { SeatSelectionStep } from "@/components/booking/seat-selection-step"
import { ReviewBookingStep } from "@/components/booking/review-booking-step"
import { PaymentStep } from "@/components/booking/payment-step"

const BOOKING_STEPS: BookingStep[] = [
  { id: 1, title: "Passenger Details", description: "Enter passenger information" },
  { id: 2, title: "Seat Selection", description: "Choose your seats" },
  { id: 3, title: "Review Booking", description: "Review your booking" },
  { id: 4, title: "Payment", description: "Complete payment" },
]

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const { bookingState, addPassenger, updatePassenger, removePassenger, toggleSeat } = useBookingState("FL123")

  const handleNextStep = () => {
    if (currentStep < BOOKING_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Flight Booking</h1>

        <BookingStepper steps={BOOKING_STEPS} currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && (
            <PassengerDetailsStep
              passengers={bookingState.passengers}
              onAddPassenger={addPassenger}
              onUpdatePassenger={updatePassenger}
              onRemovePassenger={removePassenger}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <SeatSelectionStep
              selectedSeats={bookingState.selectedSeats}
              onToggleSeat={toggleSeat}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          )}

          {currentStep === 3 && (
            <ReviewBookingStep bookingState={bookingState} onNext={handleNextStep} onPrevious={handlePreviousStep} />
          )}

          {currentStep === 4 && <PaymentStep bookingState={bookingState} onPrevious={handlePreviousStep} />}
        </div>
      </div>
    </main>
  )
}
