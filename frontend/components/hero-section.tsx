"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      {/* Background airplane pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <path d="M600 100 L700 300 L600 250 L500 300 Z" fill="currentColor" className="text-white" />
          <path d="M200 400 L300 500 L200 480 L100 500 Z" fill="currentColor" className="text-white" />
          <path d="M1000 200 L1100 350 L1000 320 L900 350 Z" fill="currentColor" className="text-white" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance">
          Book Your Journey with Ease
        </h1>
        <p className="text-lg sm:text-xl text-white/90 mb-8 text-balance">
          Find the best flights at unbeatable prices. Compare, book, and fly with confidence.
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg rounded-full"
          >
            Start Booking Now
          </Button>
        </motion.div>
      </motion.div>

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
    </section>
  )
}
