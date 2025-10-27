"use client"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { SearchFilters } from "@/types/flight"

interface FilterSidebarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

const AIRLINES = ["United Airlines", "Delta", "American Airlines", "Southwest"]
const DEPARTURE_TIMES = [
  { id: "morning", label: "Morning (6AM - 12PM)" },
  { id: "afternoon", label: "Afternoon (12PM - 6PM)" },
  { id: "evening", label: "Evening (6PM - 12AM)" },
  { id: "night", label: "Night (12AM - 6AM)" },
]
const STOPS_OPTIONS = [
  { id: "0", label: "Non-stop" },
  { id: "1", label: "1 Stop" },
  { id: "2", label: "2+ Stops" },
]

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]],
    })
  }

  const handleDepartureTimeChange = (id: string) => {
    const updated = filters.departureTime.includes(id)
      ? filters.departureTime.filter((t) => t !== id)
      : [...filters.departureTime, id]
    onFiltersChange({
      ...filters,
      departureTime: updated,
    })
  }

  const handleAirlineChange = (airline: string) => {
    const updated = filters.airlines.includes(airline)
      ? filters.airlines.filter((a) => a !== airline)
      : [...filters.airlines, airline]
    onFiltersChange({
      ...filters,
      airlines: updated,
    })
  }

  const handleStopsChange = (stops: string) => {
    const updated = filters.stops.includes(stops) ? filters.stops.filter((s) => s !== stops) : [...filters.stops, stops]
    onFiltersChange({
      ...filters,
      stops: updated,
    })
  }

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value,
    })
  }

  return (
    <Card className="h-fit p-6">
      <h2 className="mb-6 text-lg font-semibold text-foreground">Filters</h2>

      {/* Sort */}
      <div className="mb-6">
        <Label className="mb-2 block text-sm font-medium">Sort By</Label>
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low-high">Price: Low to High</SelectItem>
            <SelectItem value="price-high-low">Price: High to Low</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="departure-time">Departure Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="mb-6" />

      {/* Price Range */}
      <div className="mb-6">
        <Label className="mb-4 block text-sm font-medium">
          Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </Label>
        <Slider
          min={0}
          max={5000}
          step={50}
          value={filters.priceRange}
          onValueChange={handlePriceChange}
          className="w-full"
        />
      </div>

      <Separator className="mb-6" />

      {/* Departure Time */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">Departure Time</Label>
        <div className="space-y-2">
          {DEPARTURE_TIMES.map((time) => (
            <div key={time.id} className="flex items-center gap-2">
              <Checkbox
                id={time.id}
                checked={filters.departureTime.includes(time.id)}
                onCheckedChange={() => handleDepartureTimeChange(time.id)}
              />
              <Label htmlFor={time.id} className="cursor-pointer text-sm">
                {time.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Airlines */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">Airlines</Label>
        <div className="space-y-2">
          {AIRLINES.map((airline) => (
            <div key={airline} className="flex items-center gap-2">
              <Checkbox
                id={airline}
                checked={filters.airlines.includes(airline)}
                onCheckedChange={() => handleAirlineChange(airline)}
              />
              <Label htmlFor={airline} className="cursor-pointer text-sm">
                {airline}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Stops */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Stops</Label>
        <div className="space-y-2">
          {STOPS_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <Checkbox
                id={`stops-${option.id}`}
                checked={filters.stops.includes(option.id)}
                onCheckedChange={() => handleStopsChange(option.id)}
              />
              <Label htmlFor={`stops-${option.id}`} className="cursor-pointer text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
