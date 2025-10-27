import type { BookingStep } from "@/types/booking"
import { Check } from "lucide-react"

interface BookingStepperProps {
  steps: BookingStep[]
  currentStep: number
}

export function BookingStepper({ steps, currentStep }: BookingStepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step.id < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : step.id === currentStep
                    ? "border-primary bg-background text-primary"
                    : "border-muted bg-background text-muted-foreground"
              }`}
            >
              {step.id < currentStep ? <Check className="h-5 w-5" /> : step.id}
            </div>
            <p className="mt-2 text-sm font-medium">{step.title}</p>
          </div>

          {index < steps.length - 1 && (
            <div className={`mx-2 h-1 flex-1 ${step.id < currentStep ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  )
}
