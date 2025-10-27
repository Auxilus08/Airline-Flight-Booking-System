"use client"

import { useState, useMemo } from "react"
import { Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { PaymentRecord } from "@/types/dashboard"

interface PaymentHistoryTabProps {
  data: {
    paymentRecords: PaymentRecord[]
  }
}

export function PaymentHistoryTab({ data }: PaymentHistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all")
  const [filterMethod, setFilterMethod] = useState<"all" | "credit_card" | "debit_card" | "upi">("all")

  const filteredRecords = useMemo(() => {
    return data.paymentRecords.filter((record) => {
      const matchesSearch =
        record.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.transactionId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || record.status === filterStatus
      const matchesMethod = filterMethod === "all" || record.method === filterMethod

      return matchesSearch && matchesStatus && matchesMethod
    })
  }, [data.paymentRecords, searchTerm, filterStatus, filterMethod])

  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card"
      case "debit_card":
        return "Debit Card"
      case "upi":
        return "UPI"
      default:
        return method
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Payment History</h2>
        <p className="text-muted-foreground">View and manage all your payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-foreground">{filteredRecords.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed Payments</p>
          <p className="text-2xl font-bold text-foreground">
            {filteredRecords.filter((r) => r.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking ref or transaction ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Method</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Booking Ref</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Transaction ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No payment records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground">{record.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">{record.bookingRef}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">₹{record.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{getMethodLabel(record.method)}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{record.transactionId}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      {filteredRecords.length > 0 && (
        <div className="mt-6 flex justify-end">
          <div className="bg-secondary p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total for filtered results</p>
            <p className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  )
}
