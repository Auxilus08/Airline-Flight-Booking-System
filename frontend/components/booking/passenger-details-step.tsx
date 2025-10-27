"use client"

import { useState } from "react"
import type { Passenger } from "@/types/booking"
import { PassengerForm } from "./passenger-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Edit2 } from "lucide-react"

interface PassengerDetailsStepProps {
  passengers: Passenger[]
  onAddPassenger: (passenger: Passenger) => void
  onUpdatePassenger: (id: string, passenger: Passenger) => void
  onRemovePassenger: (id: string) => void
  onNext: () => void
}

export function PassengerDetailsStep({
  passengers,
  onAddPassenger,
  onUpdatePassenger,
  onRemovePassenger,
  onNext,
}: PassengerDetailsStepProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingPassenger, setEditingPassenger] = useState<Passenger | undefined>()

  const handleAddPassenger = (passenger: Passenger) => {
    if (editingPassenger) {
      onUpdatePassenger(editingPassenger.id, passenger)
      setEditingPassenger(undefined)
    } else {
      onAddPassenger(passenger)
    }
    setShowForm(false)
  }

  const handleEditPassenger = (passenger: Passenger) => {
    setEditingPassenger(passenger)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <PassengerForm
          passenger={editingPassenger}
          onSubmit={handleAddPassenger}
          onCancel={() => {
            setShowForm(false)
            setEditingPassenger(undefined)
          }}
        />
      ) : (
        <Button onClick={() => setShowForm(true)} className="w-full">
          {passengers.length === 0 ? "Add First Passenger" : "Add Another Passenger"}
        </Button>
      )}

      {passengers.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Passengers ({passengers.length})</h3>
          {passengers.map((passenger) => (
            <Card key={passenger.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{passenger.email}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditPassenger(passenger)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onRemovePassenger(passenger.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6">
        <Button onClick={onNext} disabled={passengers.length === 0} className="min-w-32">
          Next: Seat Selection
        </Button>
      </div>
    </div>
  )
}
