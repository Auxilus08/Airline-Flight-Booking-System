"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cardDetailsSchema, type CardDetailsFormData } from "@/lib/booking-schemas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreditCardFormProps {
  isDebitCard?: boolean
}

export function CreditCardForm({ isDebitCard }: CreditCardFormProps) {
  const {
    register,
    formState: { errors },
  } = useForm<CardDetailsFormData>({
    resolver: zodResolver(cardDetailsSchema),
  })

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input id="cardNumber" {...register("cardNumber")} placeholder="1234 5678 9012 3456" maxLength={16} />
        {errors.cardNumber && <p className="mt-1 text-sm text-destructive">{errors.cardNumber.message}</p>}
      </div>

      <div>
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input id="cardholderName" {...register("cardholderName")} placeholder="John Doe" />
        {errors.cardholderName && <p className="mt-1 text-sm text-destructive">{errors.cardholderName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
          <Input id="expiryDate" {...register("expiryDate")} placeholder="12/25" maxLength={5} />
          {errors.expiryDate && <p className="mt-1 text-sm text-destructive">{errors.expiryDate.message}</p>}
        </div>

        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input id="cvv" {...register("cvv")} placeholder="123" maxLength={4} type="password" />
          {errors.cvv && <p className="mt-1 text-sm text-destructive">{errors.cvv.message}</p>}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {isDebitCard ? "Debit card" : "Credit card"} information is secure and encrypted
      </p>
    </div>
  )
}
