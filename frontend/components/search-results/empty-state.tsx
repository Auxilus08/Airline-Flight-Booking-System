"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plane } from "lucide-react"
import Link from "next/link"

export function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Plane className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">No flights found</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Try adjusting your filters or search criteria to find available flights.
      </p>
      <Link href="/">
        <Button>Modify Search</Button>
      </Link>
    </Card>
  )
}
