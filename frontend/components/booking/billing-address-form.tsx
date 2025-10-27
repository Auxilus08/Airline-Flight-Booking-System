"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { billingAddressSchema, type BillingAddressFormData } from "@/lib/booking-schemas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BillingAddressForm() {
  const {
    register,
    formState: { errors },
  } = useForm<BillingAddressFormData>({
    resolver: zodResolver(billingAddressSchema),
  })

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input id="street" {...register("street")} placeholder="123 Main Street" />
        {errors.street && <p className="mt-1 text-sm text-destructive">{errors.street.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} placeholder="New York" />
          {errors.city && <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>}
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} placeholder="NY" />
          {errors.state && <p className="mt-1 text-sm text-destructive">{errors.state.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input id="zipCode" {...register("zipCode")} placeholder="10001" />
          {errors.zipCode && <p className="mt-1 text-sm text-destructive">{errors.zipCode.message}</p>}
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} placeholder="United States" />
          {errors.country && <p className="mt-1 text-sm text-destructive">{errors.country.message}</p>}
        </div>
      </div>
    </div>
  )
}
