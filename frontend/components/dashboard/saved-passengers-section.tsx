"use client"

import { useState } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SavedPassenger } from "@/types/dashboard"

const mockPassengers: SavedPassenger[] = [
  {
    id: "1",
    firstName: "Jane",
    lastName: "Doe",
    dateOfBirth: "1992-03-20",
    nationality: "Indian",
    passportNumber: "B87654321",
    type: "adult",
  },
  {
    id: "2",
    firstName: "Tom",
    lastName: "Doe",
    dateOfBirth: "2015-07-10",
    nationality: "Indian",
    passportNumber: "C11223344",
    type: "child",
  },
]

export function SavedPassengersSection() {
  const [passengers, setPassengers] = useState<SavedPassenger[]>(mockPassengers)
  const [isAdding, setIsAdding] = useState(false)

  const handleDelete = (id: string) => {
    setPassengers((prev) => prev.filter((p) => p.id !== id))
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
            <Input placeholder="First Name" />
            <Input placeholder="Last Name" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="date" placeholder="Date of Birth" />
            <Input placeholder="Nationality" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Passport Number" />
            <select className="px-3 py-2 border border-border rounded-md bg-background text-foreground">
              <option>Adult</option>
              <option>Child</option>
              <option>Infant</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">Save Passenger</Button>
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
                  {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)} • {passenger.passportNumber}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
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
