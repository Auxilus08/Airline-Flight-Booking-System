"use client"

import { Download, X, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Booking } from "@/types/dashboard"

interface BookingDetailsModalProps {
  booking: Booking
  onClose: () => void
}

export function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-2xl font-bold text-foreground">Booking Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Reference */}
          <div className="bg-secondary p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
            <p className="text-2xl font-bold text-foreground">{booking.bookingRef}</p>
          </div>

          {/* Flight Details */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Flight Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Flight Number</p>
                <p className="font-semibold text-foreground">{booking.flightNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Airline</p>
                <p className="font-semibold text-foreground">{booking.airline}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Departure</p>
                <p className="font-semibold text-foreground">
                  {booking.departure.code} - {booking.departure.time}
                </p>
                <p className="text-xs text-muted-foreground">{booking.departure.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Arrival</p>
                <p className="font-semibold text-foreground">
                  {booking.arrival.code} - {booking.arrival.time}
                </p>
                <p className="text-xs text-muted-foreground">{booking.arrival.date}</p>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Passengers</h3>
            <div className="space-y-2">
              {booking.passengers.map((passenger, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{passenger}</p>
                    <p className="text-sm text-muted-foreground">Seat: {booking.seats[idx]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center p-6 bg-secondary rounded-lg">
            <QrCode className="w-32 h-32 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">Scan this QR code at the airport for check-in</p>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <p className="font-semibold text-foreground capitalize">{booking.paymentMethod.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <p className="font-semibold text-foreground capitalize">{booking.paymentStatus}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-primary">₹{booking.totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Fare</span>
                <span className="text-foreground">₹{(booking.totalPrice * 0.8).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span className="text-foreground">₹{(booking.totalPrice * 0.2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-primary">₹{booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
