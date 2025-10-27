"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>

          <Skeleton className="h-10 w-full" />
        </Card>
      ))}
    </div>
  )
}
