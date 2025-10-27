"use client"

import { useState } from "react"
import type { BookingState } from "@/types/booking"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCardForm } from "./credit-card-form"
import { UPIForm } from "./upi-form"
import { BillingAddressForm } from "./billing-address-form"
import { useRouter } from "next/navigation"

interface PaymentStepProps {
  bookingState: BookingState
  onPrevious: () => void
}

export function PaymentStep({ bookingState, onPrevious }: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "debit-card" | "upi">("credit-card")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const baseFare = bookingState.selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  const taxes = Math.round(baseFare * 0.12 * 100) / 100
  const fees = 25
  const total = baseFare + taxes + fees

  const handleCompleteBooking = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate booking reference
    const bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Store booking confirmation
    localStorage.setItem(
      "booking_confirmation",
      JSON.stringify({
        bookingReference,
        bookingState,
        total,
        timestamp: new Date().toISOString(),
      }),
    )

    // Clear booking state
    localStorage.removeItem("airline_booking_state")

    // Redirect to success page
    router.push(`/booking/success?ref=${bookingReference}`)
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Fare</span>
            <span>${baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes</span>
            <span>${taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Fee</span>
            <span>${fees.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Method Selection */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Payment Method</h3>
        <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
            <TabsTrigger value="debit-card">Debit Card</TabsTrigger>
            <TabsTrigger value="upi">UPI</TabsTrigger>
          </TabsList>

          <TabsContent value="credit-card" className="mt-4">
            <CreditCardForm />
          </TabsContent>

          <TabsContent value="debit-card" className="mt-4">
            <CreditCardForm isDebitCard />
          </TabsContent>

          <TabsContent value="upi" className="mt-4">
            <UPIForm />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Billing Address */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Billing Address</h3>
        <BillingAddressForm />
      </Card>

      {/* Security Notice */}
      <Card className="border-primary/20 bg-primary/5 p-4">
        <p className="text-sm text-foreground">
          Your payment information is secure and encrypted. We never store your full card details.
        </p>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3 pt-6">
        <Button variant="outline" onClick={onPrevious} disabled={isProcessing}>
          Back
        </Button>
        <Button onClick={handleCompleteBooking} disabled={isProcessing} className="min-w-40">
          {isProcessing ? "Processing..." : `Complete Booking - $${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  )
}
