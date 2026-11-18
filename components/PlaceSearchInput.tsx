"use client"

import type { PlaceSuggestion } from "@/app/api/places/route"
import { cn } from "@/lib/utils"
import { Home, Loader2, MapPin, Search } from "lucide-react"
import { useEffect, useId, useState } from "react"

interface Props {
  value: string
  onChange: (value: string) => void
  // Vorschlag "Unterkunft" gewählt: direkt zum Inserat
  onOpenStay: (href: string) => void
  // Enter ohne gewählten Vorschlag: Suche abschicken
  onSubmit: () => void
}

// Freitext-Suche mit Vorschlägen (Combobox): Ort, Land oder Name einer Unterkunft.
// Vorher gab es nur ein Dropdown mit allen 250 Ländern.
const PlaceSearchInput = ({ value, onChange, onOpenStay, onSubmit }: Props) => {
  const listId = useId()
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const query = value.trim()
  const visible = open && query.length >= 2 ? suggestions : []

  // Vorschläge laden, 200 ms nach dem letzten Tastendruck (Debounce).
  // AbortController bricht veraltete Anfragen ab, damit keine alte Antwort
  // eine neuere überschreibt.
  useEffect(() => {
    if (query.length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        const data = (await response.json()) as { suggestions: PlaceSuggestion[] }
        setSuggestions(data.suggestions)
        setActive(-1)
      } catch {
        // abgebrochen oder offline: alte Vorschläge stehen lassen
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 200)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const pick = (item: PlaceSuggestion) => {
    setOpen(false)
    if (item.type === "stay") {
      onOpenStay(item.href)
    } else {
      onChange(item.where)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && visible.length > 0) {
      event.preventDefault()
      setOpen(true)
      setActive((index) => (index + 1) % visible.length)
    } else if (event.key === "ArrowUp" && visible.length > 0) {
      event.preventDefault()
      setActive((index) => (index <= 0 ? visible.length - 1 : index - 1))
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (active >= 0 && visible[active]) {
        pick(visible[active])
      } else {
        setOpen(false)
        onSubmit()
      }
    } else if (event.key === "Escape" && open) {
      // Nur die Liste schliessen, nicht gleich den ganzen Dialog
      event.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-x-2 rounded-lg border px-3 focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-4 shrink-0 text-muted-foreground"/>
        <input
          type="text"
          role="combobox"
          aria-expanded={visible.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search destinations"
          placeholder="Search destinations: city, country or home"
          value={value}
          maxLength={60}
          onChange={(event) => {
            onChange(event.target.value)
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
              key={`${item.type}-${item.label}-${index}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              // onMouseDown statt onClick: passiert vor dem onBlur des Eingabefelds
              onMouseDown={(event) => {
                event.preventDefault()
                pick(item)
              }}
              onMouseEnter={() => setActive(index)}
              className={cn("flex cursor-pointer items-center gap-x-3 rounded-lg px-3 py-2", index === active && "bg-muted")}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                {item.type === "country" ? item.flag : item.type === "city" ? <MapPin className="size-4"/> : <Home className="size-4"/>}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{item.label}</span>
                <span className="truncate text-xs text-muted-foreground">{item.sublabel}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PlaceSearchInput
