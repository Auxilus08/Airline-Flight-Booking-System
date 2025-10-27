"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Download, Mail, Home } from "lucide-react"
import type { BookingState } from "@/types/booking"

interface BookingConfirmation {
  bookingReference: string
  bookingState: BookingState
  total: number
  timestamp: string
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bookingRef = searchParams.get("ref")
    if (bookingRef) {
      const saved = localStorage.getItem("booking_confirmation")
      if (saved) {
        try {
          const data = JSON.parse(saved) as BookingConfirmation
          setConfirmation(data)
        } catch (error) {
          console.error("Failed to load booking confirmation:", error)
        }
      }
    }
    setIsLoading(false)
  }, [searchParams])

  const handleDownloadPDF = () => {
    // Simulate PDF download
    const element = document.createElement("a")
    const file = new Blob(
      [
        `
AIRLINE TICKET CONFIRMATION

Booking Reference: ${confirmation?.bookingReference}
Date: ${new Date(confirmation?.timestamp || "").toLocaleDateString()}

Flight Details:
- Flight Number: FL123
- Departure: 10:30 AM
- Arrival: 2:45 PM
- Duration: 4h 15m

Passengers:
${confirmation?.bookingState.passengers.map((p) => `- ${p.firstName} ${p.lastName}`).join("\n")}

Seats: ${confirmation?.bookingState.selectedSeats.map((s) => s.seatNumber).join(", ")}

Total Amount: $${confirmation?.total.toFixed(2)}

Thank you for booking with us!
      `,
      ],
      { type: "text/plain" },
    )
    element.href = URL.createObjectURL(file)
    element.download = `ticket-${confirmation?.bookingReference}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-2xl px-4">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!confirmation) {
    return (
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Card className="p-8 text-center">
            <p className="mb-4 text-lg font-semibold">Booking not found</p>
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your flight has been successfully booked</p>
        </div>

        {/* Booking Reference */}
        <Card className="mb-6 border-primary/20 bg-primary/5 p-6">
          <p className="text-sm text-muted-foreground">Booking Reference</p>
          <p className="font-mono text-2xl font-bold text-primary">{confirmation.bookingReference}</p>
          <p className="mt-2 text-xs text-muted-foreground">Save this reference for check-in and future inquiries</p>
        </Card>

        {/* Flight Details */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 font-semibold">Flight Details</h2>
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

        {/* Passengers */}
        <Card className="mb-6 p-6">
          <h2 className="mb-4 font-semibold">Passengers</h2>
          <div className="space-y-2">
            {confirmation.bookingState.passengers.map((passenger) => (
              <div key={passenger.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <p className="font-medium">
                  {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Seat: {confirmation.bookingState.selectedSeats[0]?.seatNumber}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Booking Amount */}
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Total Amount Paid</p>
            <p className="text-2xl font-bold text-primary">${confirmation.total.toFixed(2)}</p>
          </div>
        </Card>

        {/* Confirmation Email */}
        <Card className="mb-6 border-accent/20 bg-accent/5 p-4">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-accent" />
            <div>
              <p className="font-medium">Confirmation Email Sent</p>
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to {confirmation.bookingState.passengers[0]?.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleDownloadPDF} variant="outline" className="flex-1 bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Download Ticket
          </Button>
          <Button onClick={() => router.push("/")} className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </div>

        {/* Additional Info */}
        <Card className="mt-6 p-4">
          <h3 className="mb-2 font-semibold">What's Next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Check in online 24 hours before departure</li>
            <li>Arrive at the airport 2 hours before departure</li>
            <li>Bring your booking reference and valid ID</li>
            <li>For changes or cancellations, contact our support team</li>
          </ul>
        </Card>
      </div>
    </main>
  )
}
