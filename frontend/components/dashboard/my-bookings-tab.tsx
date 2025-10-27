"use client"

import { useState } from "react"
import { BookingCard } from "./booking-card"
import { BookingDetailsModal } from "./booking-details-modal"
import type { Booking } from "@/types/dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MyBookingsTabProps {
  data: {
    bookings: Booking[]
    getUpcomingBookings: () => Booking[]
    getCompletedBookings: () => Booking[]
    getCancelledBookings: () => Booking[]
    cancelBooking: (id: string) => void
  }
}

export function MyBookingsTab({ data }: MyBookingsTabProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [activeTab, setActiveTab] = useState("upcoming")

  const upcomingBookings = data.getUpcomingBookings()
  const completedBookings = data.getCompletedBookings()
  const cancelledBookings = data.getCancelledBookings()

  const getTabBookings = () => {
    switch (activeTab) {
      case "upcoming":
        return upcomingBookings
      case "completed":
        return completedBookings
      case "cancelled":
        return cancelledBookings
      default:
        return []
    }
  }

  const tabBookings = getTabBookings()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">My Bookings</h2>
        <p className="text-muted-foreground">Manage and view all your flight bookings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {tabBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No {activeTab} bookings</p>
              <p className="text-sm text-muted-foreground">
                {activeTab === "upcoming" && "Start booking your next flight!"}
                {activeTab === "completed" && "Your completed flights will appear here"}
                {activeTab === "cancelled" && "Your cancelled bookings will appear here"}
              </p>
            </div>
          ) : (
            tabBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetails={() => setSelectedBooking(booking)}
                onCancel={() => data.cancelBooking(booking.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {selectedBooking && <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
    </div>
  )
}
