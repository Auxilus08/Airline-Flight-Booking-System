"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { TravelPreference } from "@/types/dashboard"

export function TravelPreferencesSection() {
  const [preferences, setPreferences] = useState<TravelPreference>({
    seatPreference: "window",
    mealPreference: "vegetarian",
    specialAssistance: "none",
  })
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Travel Preferences</h3>
        <Button variant={isEditing ? "destructive" : "outline"} onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Seat Preference */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Seat Preference</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["window", "aisle", "middle", "any"].map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (isEditing) {
                    setPreferences({ ...preferences, seatPreference: option as any })
                  }
                }}
                className={`p-3 rounded-lg border-2 transition-colors capitalize ${
                  preferences.seatPreference === option
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-foreground hover:border-primary"
                } ${!isEditing && "cursor-default"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Preference */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Meal Preference</label>
          <select
            disabled={!isEditing}
            value={preferences.mealPreference}
            onChange={(e) => setPreferences({ ...preferences, mealPreference: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-secondary text-foreground disabled:opacity-50"
          >
            <option>Vegetarian</option>
            <option>Non-Vegetarian</option>
            <option>Vegan</option>
            <option>Gluten-Free</option>
            <option>No Preference</option>
          </select>
        </div>

        {/* Special Assistance */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Special Assistance</label>
          <select
            disabled={!isEditing}
            value={preferences.specialAssistance}
            onChange={(e) => setPreferences({ ...preferences, specialAssistance: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-secondary text-foreground disabled:opacity-50"
          >
            <option value="none">None</option>
            <option value="wheelchair">Wheelchair Assistance</option>
            <option value="visual">Visual Impairment</option>
            <option value="hearing">Hearing Impairment</option>
            <option value="mobility">Mobility Assistance</option>
          </select>
        </div>

        {isEditing && <Button className="w-full">Save Preferences</Button>}
      </div>
    </div>
  )
}
