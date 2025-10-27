"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SavedPassengersSection } from "./saved-passengers-section"
import { TravelPreferencesSection } from "./travel-preferences-section"
import type { UserProfile } from "@/types/dashboard"

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileTabProps {
  data: {
    userProfile: UserProfile
    updateUserProfile: (profile: UserProfile) => void
  }
}

export function ProfileTab({ data }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: data.userProfile,
  })

  const onSubmit = async (formData: ProfileFormData) => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    data.updateUserProfile({ ...data.userProfile, ...formData })
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="passengers">Passengers</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="mt-6">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              <Button
                variant={isEditing ? "destructive" : "outline"}
                onClick={() => {
                  if (isEditing) {
                    reset()
                  }
                  setIsEditing(!isEditing)
                }}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                  <Input
                    {...register("firstName")}
                    disabled={!isEditing}
                    className="bg-secondary"
                    placeholder="First name"
                  />
                  {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                  <Input
                    {...register("lastName")}
                    disabled={!isEditing}
                    className="bg-secondary"
                    placeholder="Last name"
                  />
                  {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Contact Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input
                    {...register("email")}
                    disabled={!isEditing}
                    className="bg-secondary"
                    type="email"
                    placeholder="Email"
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <Input
                    {...register("phone")}
                    disabled={!isEditing}
                    className="bg-secondary"
                    placeholder="Phone number"
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Personal Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
                  <Input {...register("dateOfBirth")} disabled={!isEditing} className="bg-secondary" type="date" />
                  {errors.dateOfBirth && <p className="text-destructive text-sm mt-1">{errors.dateOfBirth.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nationality</label>
                  <Input
                    {...register("nationality")}
                    disabled={!isEditing}
                    className="bg-secondary"
                    placeholder="Nationality"
                  />
                  {errors.nationality && <p className="text-destructive text-sm mt-1">{errors.nationality.message}</p>}
                </div>
              </div>

              {/* Passport Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Passport Number</label>
                <Input
                  {...register("passportNumber")}
                  disabled={!isEditing}
                  className="bg-secondary"
                  placeholder="Passport number"
                />
                {errors.passportNumber && (
                  <p className="text-destructive text-sm mt-1">{errors.passportNumber.message}</p>
                )}
              </div>

              {/* Address Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                <Input
                  {...register("address")}
                  disabled={!isEditing}
                  className="bg-secondary"
                  placeholder="Street address"
                />
                {errors.address && <p className="text-destructive text-sm mt-1">{errors.address.message}</p>}
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <Input {...register("city")} disabled={!isEditing} className="bg-secondary" placeholder="City" />
                  {errors.city && <p className="text-destructive text-sm mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">State</label>
                  <Input {...register("state")} disabled={!isEditing} className="bg-secondary" placeholder="State" />
                  {errors.state && <p className="text-destructive text-sm mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Zip Code</label>
                  <Input
                    {...register("zipCode")}
                    disabled={!isEditing}
                    className="bg-secondary"
                    placeholder="Zip code"
                  />
                  {errors.zipCode && <p className="text-destructive text-sm mt-1">{errors.zipCode.message}</p>}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                <Input {...register("country")} disabled={!isEditing} className="bg-secondary" placeholder="Country" />
                {errors.country && <p className="text-destructive text-sm mt-1">{errors.country.message}</p>}
              </div>

              {/* Save Button */}
              {isEditing && (
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </form>
          </div>
        </TabsContent>

        {/* Saved Passengers Tab */}
        <TabsContent value="passengers" className="mt-6">
          <SavedPassengersSection />
        </TabsContent>

        {/* Travel Preferences Tab */}
        <TabsContent value="preferences" className="mt-6">
          <TravelPreferencesSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
