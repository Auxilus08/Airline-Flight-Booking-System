"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface DestinationCardProps {
  destination: {
    id: string
    name: string
    country: string
    image: string
    price: number
  }
}

export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow">
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={destination.image || "/placeholder.svg"}
            alt={destination.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{destination.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{destination.country}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="text-2xl font-bold text-primary">${destination.price}</p>
            </div>
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full">
              Book Now
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
