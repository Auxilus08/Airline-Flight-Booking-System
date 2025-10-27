"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const upiSchema = z.object({
  upiId: z.string().email("Invalid UPI ID"),
})

type UPIFormData = z.infer<typeof upiSchema>

export function UPIForm() {
  const {
    register,
    formState: { errors },
  } = useForm<UPIFormData>({
    resolver: zodResolver(upiSchema),
  })

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="upiId">UPI ID</Label>
        <Input id="upiId" {...register("upiId")} placeholder="yourname@upi" />
        {errors.upiId && <p className="mt-1 text-sm text-destructive">{errors.upiId.message}</p>}
      </div>

      <p className="text-xs text-muted-foreground">You will be redirected to your UPI app to complete the payment</p>
    </div>
  )
}
