"use client"

import { motion } from "framer-motion"
import { DestinationCard } from "./destination-card"

interface Destination {
  id: string
  name: string
  country: string
  image: string
  price: number
}

const DESTINATIONS: Destination[] = [
  {
    id: "1",
    name: "Paris",
    country: "France",
    image: "/eiffel-tower-paris.png",
    price: 450,
  },
  {
    id: "2",
    name: "Tokyo",
    country: "Japan",
    image: "/tokyo-skyline-japan.jpg",
    price: 680,
  },
  {
    id: "3",
    name: "Barcelona",
    country: "Spain",
    image: "/barcelona-sagrada-familia.jpg",
    price: 380,
  },
  {
    id: "4",
    name: "Dubai",
    country: "UAE",
    image: "/dubai-burj-khalifa.png",
    price: 520,
  },
  {
    id: "5",
    name: "New York",
    country: "USA",
    image: "/nyc-skyline-twilight.png",
    price: 280,
  },
  {
    id: "6",
    name: "Sydney",
    country: "Australia",
    image: "/sydney-opera-house.png",
    price: 750,
  },
]

export function DestinationsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Popular Destinations</h2>
          <p className="text-lg text-muted-foreground">Explore our most booked destinations and find amazing deals</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <DestinationCard destination={destination} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
