"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

interface FeatureCardProps {
  feature: {
    id: string
    title: string
    description: string
    icon: React.ReactNode
  }
}

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
      <Card className="p-6 h-full flex flex-col items-center text-center hover:shadow-lg transition-shadow">
        <motion.div
          className="mb-4 p-3 bg-primary/10 rounded-full text-primary"
          whileHover={{ rotate: 10 }}
          transition={{ duration: 0.3 }}
        >
          {feature.icon}
        </motion.div>
        <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </Card>
    </motion.div>
  )
}
