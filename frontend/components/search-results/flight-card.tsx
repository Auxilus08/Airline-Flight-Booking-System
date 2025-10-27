"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Clock, Users, TrendingDown } from "lucide-react"
import type { Flight } from "@/types/flight"

interface FlightCardProps {
  flight: Flight
}

export function FlightCard({ flight }: FlightCardProps) {
  const originalPrice = Math.round(flight.price * 1.2)
  const discount = Math.round(((originalPrice - flight.price) / originalPrice) * 100)

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{flight.airline}</p>
              <p className="text-sm text-muted-foreground">Flight {flight.flightNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">${flight.price}</span>
              {discount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {discount}% off
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-through">${originalPrice}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* Departure */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Departure</p>
              <p className="font-semibold text-foreground">{flight.departureCode}</p>
              <p className="text-sm text-muted-foreground">{flight.departureTime}</p>
              <p className="text-xs text-muted-foreground">{flight.departureCity}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex w-full items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{flight.duration}</p>
              <p className="text-xs text-muted-foreground">
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Arrival */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Arrival</p>
              <p className="font-semibold text-foreground">{flight.arrivalCode}</p>
              <p className="text-sm text-muted-foreground">{flight.arrivalTime}</p>
              <p className="text-xs text-muted-foreground">{flight.arrivalCity}</p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{flight.seatsAvailable} seats available</span>
          </div>
          {flight.seatsAvailable < 5 && (
            <Badge variant="destructive" className="text-xs">
              Only {flight.seatsAvailable} left!
            </Badge>
          )}
        </div>

        <Button className="w-full">Select Flight</Button>
      </div>
    </Card>
  )
}
