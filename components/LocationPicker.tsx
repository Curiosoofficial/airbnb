"use client"

import { getCountryByValue } from "@/lib/getCountries"
import { cn } from "@/lib/utils"
import { Loader2, MapPin } from "lucide-react"
import { useEffect, useId, useState } from "react"
import HomeMap from "./HomeMap"

export interface PickedLocation {
  city: string
  country: string // ISO-Code, z. B. "CH"
  latitude: number
  longitude: number
}

// Antwort von Photon (https://photon.komoot.io): Geocoder auf OpenStreetMap-Daten,
// kostenlos und ohne API-Schlüssel
interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    countrycode?: string
    type?: string
  }
}

const PLACE_TYPES = new Set(["city", "town", "village", "hamlet", "locality", "district"])

function toLocation(feature: PhotonFeature): (PickedLocation & { label: string }) | null {
  const p = feature.properties
  const country = p.countrycode?.toUpperCase() ?? ""
  if (!getCountryByValue(country)) return null

  const city = (p.type && PLACE_TYPES.has(p.type) ? p.name : p.city ?? p.town ?? p.village ?? p.name) ?? ""
  if (!city) return null

  const [longitude, latitude] = feature.geometry.coordinates
  const label = [p.name, p.name !== city ? city : null, p.state, p.country].filter(Boolean).join(", ")
  return { city, country, latitude, longitude, label }
}

// Ort eines Inserats per Suche statt Länder-Dropdown: "Zermatt", "Rue de Rivoli Paris" ...
// Gespeichert werden Ort, Land und Koordinaten (Server rundet auf ca. 1 km).
const LocationPicker = ({ defaultValue }: { defaultValue?: Partial<PickedLocation> }) => {
  const listId = useId()
  const [picked, setPicked] = useState<PickedLocation | null>(
    defaultValue?.city && defaultValue.country && defaultValue.latitude != null && defaultValue.longitude != null
      ? (defaultValue as PickedLocation)
      : null
  )
  const [text, setText] = useState(
    defaultValue?.city ? `${defaultValue.city}, ${getCountryByValue(defaultValue.country ?? "")?.label ?? ""}` : ""
  )
  const [results, setResults] = useState<(PickedLocation & { label: string })[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [failed, setFailed] = useState(false)

  const query = text.trim()
  const visible = open && query.length >= 3 ? results : []

  useEffect(() => {
    if (query.length < 3) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`,
          { signal: controller.signal }
        )
        const data = (await response.json()) as { features: PhotonFeature[] }
        // Photon liefert denselben Ort oft mehrfach (Gemeinde, Grenze, Bahnhof ...).
        // Gleiche Beschriftung nur einmal zeigen, der erste Treffer ist der beste.
        const seen = new Set<string>()
        setResults(
          data.features
            .map(toLocation)
            .filter((item): item is PickedLocation & { label: string } => item !== null)
            .filter((item) => (seen.has(item.label) ? false : (seen.add(item.label), true)))
        )
        setActive(-1)
        setFailed(false)
      } catch {
        if (!controller.signal.aborted) setFailed(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const pick = (item: PickedLocation & { label: string }) => {
    setPicked({ city: item.city, country: item.country, latitude: item.latitude, longitude: item.longitude })
    setText(item.label)
    setOpen(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && visible.length > 0) {
      event.preventDefault()
      setActive((index) => (index + 1) % visible.length)
    } else if (event.key === "ArrowUp" && visible.length > 0) {
      event.preventDefault()
      setActive((index) => (index <= 0 ? visible.length - 1 : index - 1))
    } else if (event.key === "Enter") {
      // Enter soll das Formular nicht abschicken, sondern den Vorschlag wählen
      event.preventDefault()
      const item = visible[active >= 0 ? active : 0]
      if (item) pick(item)
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-5">
      <input type="hidden" name="city" value={picked?.city ?? ""}/>
      <input type="hidden" name="countryValue" value={picked?.country ?? ""}/>
      <input type="hidden" name="latitude" value={picked?.latitude ?? ""}/>
      <input type="hidden" name="longitude" value={picked?.longitude ?? ""}/>

      <div className="relative">
        <div className="flex items-center gap-x-2 rounded-lg border px-3 focus-within:ring-2 focus-within:ring-ring">
          <MapPin className="size-4 shrink-0 text-muted-foreground"/>
          <input
            type="text"
            role="combobox"
            aria-expanded={visible.length > 0}
            aria-controls={listId}
            aria-label="Search for a city or address"
            placeholder="Enter a city or address, e.g. Zermatt"
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKeyDown}
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground"/>}
        </div>

        {visible.length > 0 && (
          <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border bg-background p-1 shadow-lg">
            {visible.map((item, index) => (
              <li
                key={`${item.label}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => {
                  event.preventDefault()
                  pick(item)
                }}
                onMouseEnter={() => setActive(index)}
                className={cn("flex cursor-pointer items-center gap-x-3 rounded-lg px-3 py-2 text-sm", index === active && "bg-muted")}
              >
                <span className="text-lg">{getCountryByValue(item.country)?.flag}</span>
                <span className="truncate">{item.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {failed && <p className="text-sm text-destructive">The address search is not reachable right now. Please try again.</p>}

      <p className="text-sm text-muted-foreground">
        {picked
          ? <>Selected: <span className="font-medium text-foreground">{picked.city}, {getCountryByValue(picked.country)?.label}</span>. Guests only see the approximate area, not your exact address.</>
          : "Start typing and pick a place from the list."}
      </p>

      <HomeMap locationValue={picked?.country ?? ""} latitude={picked?.latitude} longitude={picked?.longitude}/>
    </div>
  )
}

export default LocationPicker
