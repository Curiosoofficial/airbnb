"use client"

import { formatDateRange, fromDateKey, toDateKey } from "@/lib/dates"
import { plural } from "@/lib/format"
import { getCountryByValue } from "@/lib/getCountries"
import { useMediaQuery } from "@/lib/hooks"
import { addDays } from "date-fns"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import CountrySelect from "./CountrySelect"
import Counter from "./Counter"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Separator } from "./ui/separator"

// Suche wie bei Airbnb: Wo? Wann? Wer? Die Werte landen in der URL
// (?country=CH&checkIn=2027-03-01&checkOut=2027-03-05&guests=2). So kann man
// eine Suche als Link teilen, und die Startseite filtert serverseitig.
const SearchBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlCountry = searchParams.get("country") ?? ""
  const urlCheckIn = searchParams.get("checkIn") ?? ""
  const urlCheckOut = searchParams.get("checkOut") ?? ""
  const urlGuests = Number(searchParams.get("guests")) || 0

  const [open, setOpen] = useState(false)
  const [country, setCountry] = useState(urlCountry)
  const [range, setRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(urlGuests || 1)
  const [resetKey, setResetKey] = useState(0)
  const twoMonths = useMediaQuery("(min-width: 768px)")

  // Beim Öffnen die aktuelle Suche aus der URL übernehmen
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCountry(urlCountry)
      setRange(
        fromDateKey(urlCheckIn) && fromDateKey(urlCheckOut)
          ? { from: fromDateKey(urlCheckIn), to: fromDateKey(urlCheckOut) }
          : undefined
      )
      setGuests(urlGuests || 1)
      setResetKey((key) => key + 1)
    }
    setOpen(isOpen)
  }

  const clearAll = () => {
    setCountry("")
    setRange(undefined)
    setGuests(1)
    setResetKey((key) => key + 1)
  }

  const submit = () => {
    // Kategorie-Filter und Ansicht (Liste/Karte) bleiben erhalten
    const params = new URLSearchParams(searchParams.toString())
    const set = (key: string, value: string) => (value ? params.set(key, value) : params.delete(key))

    set("country", country)
    set("checkIn", range?.from && range?.to ? toDateKey(range.from) : "")
    set("checkOut", range?.from && range?.to ? toDateKey(range.to) : "")
    set("guests", guests > 1 ? String(guests) : "")

    const query = params.toString()
    router.push(query ? `/?${query}` : "/")
    setOpen(false)
  }

  const countryInfo = urlCountry ? getCountryByValue(urlCountry) : undefined
  const whereLabel = countryInfo ? `${countryInfo.flag} ${countryInfo.label}` : "Anywhere"
  const whenLabel = urlCheckIn && urlCheckOut ? formatDateRange(urlCheckIn, urlCheckOut) : "Any week"
  const whoLabel = urlGuests > 1 ? plural(urlGuests, "guest") : "Add guests"
  const isHome = pathname === "/"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center rounded-full border py-2 pl-5 pr-2 shadow-sm transition-shadow hover:shadow-md max-md:w-full max-md:min-w-0"
          aria-label="Search stays"
        >
          {/* Desktop: drei Felder wie bei Airbnb, Handy: ein Feld */}
          <span className="hidden md:flex items-center text-sm">
            <span className="font-medium">{isHome ? whereLabel : "Anywhere"}</span>
            <span className="mx-4 h-6 w-px bg-border"/>
            <span className="font-medium">{isHome ? whenLabel : "Any week"}</span>
            <span className="mx-4 h-6 w-px bg-border"/>
            <span className={isHome && urlGuests > 1 ? "font-medium" : "text-muted-foreground"}>{isHome ? whoLabel : "Add guests"}</span>
          </span>
          <span className="md:hidden flex-1 min-w-0 truncate text-left text-sm font-medium">
            {isHome && (countryInfo || urlCheckIn) ? `${whereLabel} · ${whenLabel}` : "Where to?"}
          </span>
          <span className="ml-3 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Search className="size-4"/>
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Find your next stay</DialogTitle>
          <DialogDescription>Search by country, dates and number of guests.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-y-2">
          <h3 className="font-medium">Where</h3>
          <CountrySelect key={`country-${resetKey}`} name="searchCountry" defaultValue={country} placeholder="Anywhere" onChange={setCountry}/>
        </div>

        <Separator/>

        <div className="flex flex-col gap-y-2">
          <h3 className="font-medium">When</h3>
          <p className="text-sm text-muted-foreground">
            {range?.from && range?.to
              ? formatDateRange(toDateKey(range.from), toDateKey(range.to))
              : "Select check-in and checkout to see only available homes"}
          </p>
          <div className="flex justify-center">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              disabled={{ before: new Date() }}
              min={1}
              numberOfMonths={twoMonths ? 2 : 1}
              startMonth={new Date()}
              endMonth={addDays(new Date(), 365)}
            />
          </div>
        </div>

        <Separator/>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Who</h3>
            <p className="text-sm text-muted-foreground">Number of guests</p>
          </div>
          <Counter key={`guests-${resetKey}`} name="searchGuests" defaultValue={guests} onChange={setGuests}/>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <Button type="button" variant="ghost" className="underline" onClick={clearAll}>
            Clear all
          </Button>
          <Button type="button" size="lg" onClick={submit}>
            <Search className="mr-2 size-4"/> Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SearchBar
