import { z } from "zod"

export const passengerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date)
    const age = new Date().getFullYear() - birthDate.getFullYear()
    return age >= 18
  }, "Passenger must be at least 18 years old"),
  passportNumber: z.string().min(6, "Passport number must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
})

export const cardDetailsSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry date must be MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3-4 digits"),
})

export const billingAddressSchema = z.object({
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5,6}$/, "Invalid zip code"),
  country: z.string().min(2, "Country is required"),
})

export type PassengerFormData = z.infer<typeof passengerSchema>
export type CardDetailsFormData = z.infer<typeof cardDetailsSchema>
export type BillingAddressFormData = z.infer<typeof billingAddressSchema>
