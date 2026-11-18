"use client"

import { amenities } from "@/constants/amenities"
import { cn } from "@/lib/utils"
import { SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"

const SORTS = [
  { value: "", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
]

const COUNT_OPTIONS = [0, 1, 2, 3, 4, 5]

// Auswahl "Any, 1, 2, 3, 4, 5+" wie bei Airbnb ("Rooms and beds")
const CountPills = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
  <div className="flex flex-col gap-y-2">
    <span className="text-sm">{label}</span>
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {COUNT_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition-colors hover:border-foreground",
            value === option && "border-foreground bg-foreground text-background"
          )}
        >
          {option === 0 ? "Any" : option === 5 ? "5+" : option}
        </button>
      ))}
    </div>
  </div>
)

interface Props {
  priceBounds: { min: number; max: number }
}

const FiltersDialog = ({ priceBounds }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [bedrooms, setBedrooms] = useState(0)
  const [bathrooms, setBathrooms] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState("")

  // Anzahl aktiver Filter für das Abzeichen am Knopf
  const activeCount = ["minPrice", "maxPrice", "bedrooms", "bathrooms", "sort"].filter((key) => searchParams.get(key)).length
    + (searchParams.get("amenities")?.split(",").filter(Boolean).length ?? 0)

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setMinPrice(searchParams.get("minPrice") ?? "")
      setMaxPrice(searchParams.get("maxPrice") ?? "")
      setBedrooms(Number(searchParams.get("bedrooms")) || 0)
      setBathrooms(Number(searchParams.get("bathrooms")) || 0)
      setSelected(searchParams.get("amenities")?.split(",").filter(Boolean) ?? [])
      setSort(searchParams.get("sort") ?? "")
    }
    setOpen(isOpen)
  }

  const toggleAmenity = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  const clearAll = () => {
    setMinPrice("")
    setMaxPrice("")
    setBedrooms(0)
    setBathrooms(0)
    setSelected([])
    setSort("")
  }

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString())
    const set = (key: string, value: string) => (value ? params.set(key, value) : params.delete(key))

    set("minPrice", minPrice)
    set("maxPrice", maxPrice)
    set("bedrooms", bedrooms ? String(bedrooms) : "")
    set("bathrooms", bathrooms ? String(bathrooms) : "")
    set("amenities", selected.join(","))
    set("sort", sort)

    const query = params.toString()
    router.push(query ? `/?${query}` : "/", { scroll: false })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="relative h-12 shrink-0 rounded-xl">
          <SlidersHorizontal className="mr-2 size-4"/> Filters
          {activeCount > 0 && (
            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-foreground text-xs text-background">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>Narrow down the homes by price, rooms and amenities.</DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-y-3">
          <h3 className="font-medium">Price range</h3>
          <p className="text-sm text-muted-foreground">Nightly prices before fees</p>
          <div className="flex items-center gap-x-4">
            <div className="flex flex-1 flex-col gap-y-1">
              <Label htmlFor="minPrice" className="text-xs text-muted-foreground">Minimum ($)</Label>
              <Input id="minPrice" type="number" inputMode="numeric" min={0} placeholder={String(priceBounds.min)} value={minPrice} onChange={(event) => setMinPrice(event.target.value)}/>
            </div>
            <span className="mt-5">–</span>
            <div className="flex flex-1 flex-col gap-y-1">
              <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">Maximum ($)</Label>
              <Input id="maxPrice" type="number" inputMode="numeric" min={0} placeholder={String(priceBounds.max)} value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}/>
            </div>
          </div>
        </section>

        <Separator/>

        <section className="flex flex-col gap-y-4">
          <h3 className="font-medium">Rooms and bathrooms</h3>
          <CountPills label="Bedrooms" value={bedrooms} onChange={setBedrooms}/>
          <CountPills label="Bathrooms" value={bathrooms} onChange={setBathrooms}/>
        </section>

        <Separator/>

        <section className="flex flex-col gap-y-3">
          <h3 className="font-medium">Amenities</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {amenities.map((amenity) => (
              <label key={amenity.id} className="flex cursor-pointer items-center gap-x-3 rounded-lg p-2 text-sm hover:bg-muted">
                <input
                  type="checkbox"
                  checked={selected.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                  className="size-4 accent-foreground"
                />
                <amenity.icon className="size-4 shrink-0"/> {amenity.label}
              </label>
            ))}
          </div>
        </section>

        <Separator/>

        <section className="flex flex-col gap-y-3">
          <h3 className="font-medium">Sort by</h3>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Sort by">
            {SORTS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={sort === option.value}
                onClick={() => setSort(option.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors hover:border-foreground",
                  sort === option.value && "border-foreground bg-foreground text-background"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between border-t pt-4">
          <Button type="button" variant="ghost" className="underline" onClick={clearAll}>Clear all</Button>
          <Button type="button" size="lg" onClick={apply}>Show homes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FiltersDialog
