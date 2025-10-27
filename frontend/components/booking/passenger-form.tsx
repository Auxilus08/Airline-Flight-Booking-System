"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { passengerSchema, type PassengerFormData } from "@/lib/booking-schemas"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Passenger } from "@/types/booking"
import { v4 as uuidv4 } from "uuid"

interface PassengerFormProps {
  passenger?: Passenger
  onSubmit: (passenger: Passenger) => void
  onCancel: () => void
}

export function PassengerForm({ passenger, onSubmit, onCancel }: PassengerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PassengerFormData>({
    resolver: zodResolver(passengerSchema),
    defaultValues: passenger
      ? {
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          dateOfBirth: passenger.dateOfBirth,
          passportNumber: passenger.passportNumber,
          email: passenger.email,
          phone: passenger.phone,
        }
      : undefined,
  })

  const handleFormSubmit = (data: PassengerFormData) => {
    onSubmit({
      id: passenger?.id || uuidv4(),
      ...data,
    })
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register("firstName")} placeholder="John" />
            {errors.firstName && <p className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register("lastName")} placeholder="Doe" />
            {errors.lastName && <p className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            {errors.dateOfBirth && <p className="mt-1 text-sm text-destructive">{errors.dateOfBirth.message}</p>}
          </div>

          <div>
            <Label htmlFor="passportNumber">Passport Number</Label>
            <Input id="passportNumber" {...register("passportNumber")} placeholder="ABC123456" />
            {errors.passportNumber && <p className="mt-1 text-sm text-destructive">{errors.passportNumber.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register("phone")} placeholder="+1234567890" />
            {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {passenger ? "Update Passenger" : "Add Passenger"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
