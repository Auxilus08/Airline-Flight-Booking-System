"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MyBookingsTab } from "@/components/dashboard/my-bookings-tab"
import { ProfileTab } from "@/components/dashboard/profile-tab"
import { PaymentHistoryTab } from "@/components/dashboard/payment-history-tab"
import { useDashboardData } from "@/hooks/use-dashboard-data"

type TabType = "bookings" | "profile" | "payments" | "notifications" | "settings"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("bookings")
  const dashboardData = useDashboardData()

  const renderTabContent = () => {
    // Show loading state
    if (dashboardData.isLoading) {
      return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      )
    }

    // Show error state
    if (dashboardData.error) {
      return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading dashboard data</p>
            <p className="text-muted-foreground text-sm">{dashboardData.error}</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case "bookings":
        return <MyBookingsTab data={dashboardData} />
      case "profile":
        // Create a default profile if none exists
        const profileData = {
          userProfile: dashboardData.userProfile || {
            id: "1",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            nationality: "",
            passportNumber: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          updateUserProfile: dashboardData.updateUserProfile,
        }
        return <ProfileTab data={profileData} />
      case "payments":
        return <PaymentHistoryTab data={dashboardData} />
      case "notifications":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Notifications</h2>
            <p className="text-muted-foreground">No new notifications</p>
          </div>
        )
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Settings coming soon</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabType)}>
      {renderTabContent()}
    </DashboardLayout>
  )
}
