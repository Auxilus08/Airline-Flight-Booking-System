"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SavedPassenger } from "@/types/dashboard"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function SavedPassengersSection() {
  const [passengers, setPassengers] = useState<SavedPassenger[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    email: "",
    phone: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchPassengers()
  }, [])

  const fetchPassengers = async () => {
    try {
      setIsLoading(true)
      const response: any = await api.passengers.getAll()
      
      const transformedPassengers = response.data.map((p: any) => ({
        id: p.PASSENGER_ID?.toString() || p.passenger_id?.toString(),
        firstName: p.FIRST_NAME || p.first_name,
        lastName: p.LAST_NAME || p.last_name,
        dateOfBirth: p.DATE_OF_BIRTH || p.date_of_birth,
        nationality: p.NATIONALITY || p.nationality,
        passportNumber: p.PASSPORT_NUMBER || p.passport_number,
        type: "adult" as const,
      }))
      
      setPassengers(transformedPassengers)
    } catch (error) {
      console.error("Error fetching passengers:", error)
      toast({
        title: "Error",
        description: "Failed to load passengers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.passportNumber || !formData.dateOfBirth) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      await api.passengers.create({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        passport_number: formData.passportNumber,
        date_of_birth: formData.dateOfBirth,
        nationality: formData.nationality,
      })

      toast({
        title: "Success",
        description: "Passenger added successfully",
      })

      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
        passportNumber: "",
        email: "",
        phone: "",
      })
      setIsAdding(false)
      await fetchPassengers()
    } catch (error: any) {
      console.error("Error adding passenger:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add passenger",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this passenger?")) {
      return
    }

    try {
      await api.passengers.delete(id)
      toast({
        title: "Success",
        description: "Passenger deleted successfully",
      })
      await fetchPassengers()
    } catch (error: any) {
      console.error("Error deleting passenger:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete passenger",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <p className="text-muted-foreground text-center py-8">Loading passengers...</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Saved Passengers</h3>
        <Button onClick={() => setIsAdding(!isAdding)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Passenger
        </Button>
      </div>

      {isAdding && (
        <div className="bg-secondary p-4 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="First Name" 
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
            <Input 
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <Input 
              placeholder="Phone (optional)"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              type="date" 
              placeholder="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            />
            <Input 
              placeholder="Nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Input 
              placeholder="Passport Number"
              value={formData.passportNumber}
              onChange={(e) => handleInputChange("passportNumber", e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSubmit}>Save Passenger</Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {passengers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No saved passengers yet</p>
        ) : (
          passengers.map((passenger) => (
            <div key={passenger.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="font-semibold text-foreground">
                  {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {passenger.passportNumber} • {passenger.nationality || "N/A"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(passenger.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
