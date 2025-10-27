"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SearchResultsHeaderProps {
  resultsCount: number
}

export function SearchResultsHeader({ resultsCount }: SearchResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Flight Results</h1>
        <p className="mt-2 text-muted-foreground">
          Found <span className="font-semibold text-primary">{resultsCount}</span> flights matching your search
        </p>
      </div>
      <Button className="w-full sm:w-auto">Modify Search</Button>
    </div>
  )
}
