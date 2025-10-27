"use client"

import type React from "react"

import { motion } from "framer-motion"
import { FeatureCard } from "./feature-card"
import { Shield, Clock, RotateCcw, Lock } from "lucide-react"

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const FEATURES: Feature[] = [
  {
    id: "1",
    title: "Best Price Guarantee",
    description: "We guarantee the lowest prices on flights. If you find a cheaper option, we'll match it.",
    icon: <Shield className="w-8 h-8" />,
  },
  {
    id: "2",
    title: "24/7 Support",
    description: "Our dedicated support team is available round the clock to assist you with any queries.",
    icon: <Clock className="w-8 h-8" />,
  },
  {
    id: "3",
    title: "Easy Cancellation",
    description: "Cancel your booking anytime with no hidden charges. Full refund guaranteed.",
    icon: <RotateCcw className="w-8 h-8" />,
  },
  {
    id: "4",
    title: "Secure Payment",
    description: "Your payment information is encrypted and secured with industry-leading technology.",
    icon: <Lock className="w-8 h-8" />,
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Choose Us?</h2>
          <p className="text-lg text-muted-foreground">
            Experience the best flight booking service with our premium features
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
