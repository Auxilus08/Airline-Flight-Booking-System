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
    switch (activeTab) {
      case "bookings":
        return <MyBookingsTab data={dashboardData} />
      case "profile":
        return <ProfileTab data={dashboardData} />
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
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  )
}
