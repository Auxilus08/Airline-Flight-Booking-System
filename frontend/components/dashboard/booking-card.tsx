"use client"

import { Calendar, MapPin, Users, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Booking } from "@/types/dashboard"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BookingCardProps {
  booking: Booking
  onViewDetails: () => void
  onCancel: () => void
}

export function BookingCard({ booking, onViewDetails, onCancel }: BookingCardProps) {
  const statusConfig = {
    confirmed: { color: "bg-green-100 text-green-800", label: "Confirmed", icon: CheckCircle2 },
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending", icon: Clock },
    cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled", icon: AlertCircle },
  }

  const config = statusConfig[booking.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Booking Reference</p>
            <p className="font-bold text-lg text-foreground">{booking.bookingRef}</p>
          </div>
        </div>
        <Badge className={config.color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Departure */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Departure</p>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{booking.departure.code}</p>
            <p className="text-sm text-muted-foreground">{booking.departure.airport}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
              <Calendar className="w-4 h-4" />
              {booking.departure.date}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {booking.departure.time}
            </div>
          </div>
        </div>

        {/* Flight Info */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-2">Flight</p>
          <p className="font-bold text-lg text-foreground mb-2">{booking.flightNumber}</p>
          <div className="w-full h-px bg-border mb-2"></div>
          <p className="text-xs text-muted-foreground">{booking.airline}</p>
        </div>

        {/* Arrival */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Arrival</p>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{booking.arrival.code}</p>
            <p className="text-sm text-muted-foreground">{booking.arrival.airport}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
              <Calendar className="w-4 h-4" />
              {booking.arrival.date}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {booking.arrival.time}
            </div>
          </div>
        </div>
      </div>

      {/* Passengers and Seats */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            Passengers
          </div>
          <p className="font-semibold text-foreground">{booking.passengers.length} passenger(s)</p>
          <p className="text-xs text-muted-foreground mt-1">{booking.passengers.join(", ")}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            Seats
          </div>
          <p className="font-semibold text-foreground">{booking.seats.join(", ")}</p>
        </div>
      </div>

      {/* Price and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Price</p>
          <p className="text-2xl font-bold text-primary">₹{booking.totalPrice.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewDetails}>
            View Ticket
          </Button>
          {booking.status === "confirmed" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel Booking</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel} className="bg-destructive text-destructive-foreground">
                    Cancel Booking
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  )
}
