"use client"

import type React from "react"

import { useState } from "react"
import { Menu, X, LogOut, Plane, CreditCard, Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { id: "bookings", label: "My Bookings", icon: Plane },
    { id: "profile", label: "Profile", icon: User },
    { id: "payments", label: "Payment History", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6 text-sidebar-primary" />
              <span className="font-bold text-lg text-sidebar-foreground">SkyBook</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-sidebar-foreground hover:text-sidebar-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    activeTab === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:text-sidebar-primary bg-transparent"
              onClick={() => {
                // Handle logout
              }}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground hover:text-primary">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
            JD
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
