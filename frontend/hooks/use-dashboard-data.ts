"use client"

import { useState, useCallback, useEffect } from "react"
import type { Booking, UserProfile, PaymentRecord } from "@/types/dashboard"
import { api } from "@/lib/api"

export function useDashboardData() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch bookings and payments in parallel
        const [bookingsResponse, paymentsResponse] = await Promise.all([
          api.bookings.getAll(),
          api.payments.getAll(),
        ]) as [any, any]

        // Transform bookings data from backend to frontend format
        const transformedBookings = transformBookingsData(bookingsResponse.data || [])
        setBookings(transformedBookings)

        // Transform payments data from backend to frontend format
        const transformedPayments = transformPaymentsData(paymentsResponse.data || [])
        setPaymentRecords(transformedPayments)

        // For now, we'll use the first user if available
        // In a real app, this would come from authentication context
        if (bookingsResponse.data && bookingsResponse.data.length > 0) {
          // We could fetch user profile here if we had a user ID
          // const userResponse = await api.users.getProfile(userId)
          // setUserProfile(transformUserData(userResponse.data))
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Transform bookings from backend format to frontend format
  const transformBookingsData = (backendBookings: any[]): Booking[] => {
    return backendBookings.map((b: any) => {
      // Extract flight details if tickets are available
      const ticket = b.tickets && b.tickets.length > 0 ? b.tickets[0] : null
      
      return {
        id: (b.BOOKING_ID || b.booking_id)?.toString() || "",
        bookingRef: `BK${(b.BOOKING_ID || b.booking_id)?.toString().padStart(6, '0')}`,
        flightNumber: ticket?.FLIGHT_NUMBER || ticket?.flight_number || "N/A",
        airline: "Air India", // Default airline, could be fetched from flight data
        departure: {
          airport: ticket?.ORIGIN_CITY || ticket?.origin_city || "Unknown",
          code: ticket?.ORIGIN_CODE || ticket?.origin_code || "N/A",
          time: formatTime(ticket?.DEPARTURE_TIME || ticket?.departure_time),
          date: formatDate(ticket?.DEPARTURE_TIME || ticket?.departure_time || b.BOOKING_DATE || b.booking_date),
        },
        arrival: {
          airport: ticket?.DESTINATION_CITY || ticket?.destination_city || "Unknown",
          code: ticket?.DESTINATION_CODE || ticket?.destination_code || "N/A",
          time: formatTime(ticket?.ARRIVAL_TIME || ticket?.arrival_time),
          date: formatDate(ticket?.ARRIVAL_TIME || ticket?.arrival_time || b.BOOKING_DATE || b.booking_date),
        },
        passengers: [(b.PASSENGER_NAME || b.passenger_name || "Unknown")],
        seats: b.tickets?.map((t: any) => t.SEAT_NUMBER || t.seat_number).filter(Boolean) || [],
        status: mapStatus(b.STATUS || b.status || b.BOOKING_STATUS || b.booking_status),
        totalPrice: parseFloat(b.TOTAL_AMOUNT || b.total_amount || "0"),
        paymentMethod: mapPaymentMethod(b.PAYMENT_METHOD || b.payment_method || "credit_card"),
        paymentStatus: mapPaymentStatus(b.PAYMENT_STATUS || b.payment_status),
        bookingDate: formatDate(b.BOOKING_DATE || b.booking_date),
      }
    })
  }

  // Transform payments from backend format to frontend format
  const transformPaymentsData = (backendPayments: any[]): PaymentRecord[] => {
    return backendPayments.map((p: any) => ({
      id: (p.PAYMENT_ID || p.payment_id)?.toString() || "",
      bookingRef: `BK${(p.BOOKING_ID || p.booking_id)?.toString().padStart(6, '0')}`,
      date: formatDate(p.PAYMENT_DATE || p.payment_date),
      amount: parseFloat(p.AMOUNT || p.amount || "0"),
      method: mapPaymentMethod(p.METHOD || p.method || p.PAYMENT_METHOD || p.payment_method),
      status: mapPaymentStatus(p.STATUS || p.status),
      transactionId: p.TRANSACTION_ID || p.transaction_id || p.TRANSACTION_REFERENCE || p.transaction_reference || "N/A",
    }))
  }

  // Helper functions
  const formatDate = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0]
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  const formatTime = (timeStr: string | Date | null | undefined): string => {
    if (!timeStr) return "00:00"
    const date = new Date(timeStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const mapStatus = (status: string | null | undefined): "confirmed" | "pending" | "cancelled" => {
    const statusLower = (status || "pending").toLowerCase()
    if (statusLower === "confirmed") return "confirmed"
    if (statusLower === "cancelled") return "cancelled"
    return "pending"
  }

  const mapPaymentStatus = (status: string | null | undefined): "completed" | "pending" | "failed" => {
    const statusLower = (status || "pending").toLowerCase()
    if (statusLower === "completed") return "completed"
    if (statusLower === "failed") return "failed"
    return "pending"
  }

  const mapPaymentMethod = (method: string | null | undefined): "credit_card" | "debit_card" | "upi" => {
    const methodLower = (method || "credit_card").toLowerCase().replace(/[_\s]/g, "_")
    if (methodLower.includes("debit")) return "debit_card"
    if (methodLower.includes("upi")) return "upi"
    return "credit_card"
  }

  const getUpcomingBookings = useCallback(() => {
    return bookings.filter((b) => b.status === "confirmed" && new Date(b.departure.date) >= new Date())
  }, [bookings])

  const getCompletedBookings = useCallback(() => {
    return bookings.filter((b) => b.status === "confirmed" && new Date(b.departure.date) < new Date())
  }, [bookings])

  const getCancelledBookings = useCallback(() => {
    return bookings.filter((b) => b.status === "cancelled")
  }, [bookings])

  const updateUserProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile)
  }, [])

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      await api.bookings.cancel(bookingId)
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b)))
    } catch (error) {
      console.error("Error cancelling booking:", error)
      throw error
    }
  }, [])

  return {
    bookings,
    userProfile,
    paymentRecords,
    isLoading,
    error,
    getUpcomingBookings,
    getCompletedBookings,
    getCancelledBookings,
    updateUserProfile,
    cancelBooking,
  }
}

