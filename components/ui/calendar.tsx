"use client"

import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

// Dünner Wrapper um react-day-picker: Standard-Styles plus Airbnb-Farben
// (schwarze Auswahl, grauer Zeitraum dazwischen). Siehe .rdp-airbnb in globals.css
function Calendar({ className, ...props }: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={false}
      weekStartsOn={1}
      className={cn("rdp-airbnb", className)}
      {...props}
    />
  )
}

export { Calendar }
