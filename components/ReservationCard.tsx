"use client"

import { createReservation } from "@/lib/actions/actions"
import { countNights, fromDateKey, toDateKey } from "@/lib/dates"
import { formatPrice, formatRating, plural } from "@/lib/format"
import { useMediaQuery } from "@/lib/hooks"
import type { FormState } from "@/lib/types"
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { addDays, format, subDays } from "date-fns"
import { Loader2, Star } from "lucide-react"
import Link from "next/link"
import { useActionState, useMemo, useState } from "react"
import { useFormStatus } from "react-dom"
import type { DateRange } from "react-day-picker"
import Counter from "./Counter"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

interface Props {
  homeId: string
  price: number
  maxGuests: number
  // Bereits gebuchte Zeiträume als "YYYY-MM-DD" (end = Check-out-Tag)
  booked: { start: string; end: string }[]
  isOwner: boolean
  isLoggedIn: boolean
  rating?: { average: number; count: number } | null
}

const MAX_NIGHTS = 28

const ReserveButton = ({ disabled }: { disabled: boolean }) => {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full text-base" disabled={disabled || pending}>
      {pending ? <><Loader2 className="mr-2 size-4 animate-spin"/> Reserving...</> : "Reserve"}
    </Button>
  )
}

const ReservationCard = ({ homeId, price, maxGuests, booked, isOwner, isLoggedIn, rating }: Props) => {
  const [state, formAction] = useActionState<FormState, FormData>(createReservation, null)
  const [range, setRange] = useState<DateRange | undefined>()
  const [open, setOpen] = useState(false)
  // Auf breiten Bildschirmen zwei Monate nebeneinander, auf dem Handy einer
  const twoMonths = useMediaQuery("(min-width: 768px)")

  // Gebuchte Nächte sperren: von Check-in bis einen Tag vor Check-out.
  // Am Check-out-Tag selbst darf die nächste Buchung beginnen.
  const bookedNights = useMemo(
    () =>
      booked.flatMap(({ start, end }) => {
        const from = fromDateKey(start)
        const to = fromDateKey(end)
        return from && to ? [{ from, to: subDays(to, 1) }] : []
      }),
    [booked]
  )
  const disabledDays = useMemo(() => [{ before: new Date() }, ...bookedNights], [bookedNights])

  const startKey = range?.from ? toDateKey(range.from) : ""
  const endKey = range?.to ? toDateKey(range.to) : ""
  const nights = startKey && endKey ? countNights(startKey, endKey) : 0
  const total = nights * price

  const dateField = (label: string, date?: Date) => (
    <div className="flex flex-col px-3 py-2 text-left">
      <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
      <span className={date ? "text-sm" : "text-sm text-muted-foreground"}>
        {date ? format(date, "M/d/yyyy") : "Add date"}
      </span>
    </div>
  )

  return (
    <div className="rounded-xl border p-6 shadow-xl">
      <div className="mb-5 flex items-baseline justify-between gap-x-2">
        <p>
          <span className="text-2xl font-semibold">{formatPrice(price)}</span>{" "}
          <span className="text-muted-foreground">night</span>
        </p>
        {rating && (
          <a href="#reviews" className="flex items-center gap-x-1 text-sm">
            <Star className="size-3.5 fill-foreground"/>
            <span className="font-medium">{formatRating(rating.average)}</span>
            <span className="text-muted-foreground underline">· {plural(rating.count, "review")}</span>
          </a>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-y-4">
        <input type="hidden" name="homeId" value={homeId}/>
        <input type="hidden" name="startDate" value={startKey}/>
        <input type="hidden" name="endDate" value={endKey}/>

        <div className="rounded-lg border">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="grid w-full grid-cols-2 divide-x border-b hover:bg-muted/50 rounded-t-lg" aria-label="Choose dates">
                {dateField("Check-in", range?.from)}
                {dateField("Checkout", range?.to)}
              </button>
            </PopoverTrigger>
            {/* Nie höher als der freie Platz im Fenster, sonst wird oben abgeschnitten */}
            <PopoverContent align="end" collisionPadding={16} className="w-auto max-h-[var(--radix-popover-content-available-height)] overflow-y-auto">
              <p className="font-semibold">
                {nights > 0 ? plural(nights, "night") : "Select dates"}
              </p>
              <p className="mb-2 text-sm text-muted-foreground">
                {nights > 0
                  ? `${format(range!.from!, "MMM d")} – ${format(range!.to!, "MMM d, yyyy")}`
                  : "Crossed-out days are already booked"}
              </p>
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                disabled={disabledDays}
                modifiers={{ booked: bookedNights }}
                modifiersClassNames={{ booked: "rdp-booked" }}
                excludeDisabled
                min={1}
                max={MAX_NIGHTS}
                numberOfMonths={twoMonths ? 2 : 1}
                startMonth={new Date()}
                endMonth={addDays(new Date(), 365)}
              />
              <div className="mt-2 flex justify-between">
                <Button type="button" variant="ghost" size="sm" className="underline" onClick={() => setRange(undefined)}>
                  Clear dates
                </Button>
                <Button type="button" size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wide">Guests</span>
              <span className="text-xs text-muted-foreground">max. {maxGuests}</span>
            </div>
            <Counter name="guests" max={maxGuests}/>
          </div>
        </div>

        {isOwner ? (
          <Button asChild size="lg" variant="secondary" className="w-full">
            <Link href={`/home/${homeId}/edit`}>This is your home – edit listing</Link>
          </Button>
        ) : isLoggedIn ? (
          <ReserveButton disabled={nights < 1}/>
        ) : (
          // Nach dem Login zurück zu diesem Inserat statt auf die Startseite
          <Button asChild size="lg" className="w-full text-base">
            <LoginLink postLoginRedirectURL={`/api/auth/creation?next=${encodeURIComponent(`/home/${homeId}`)}`}>
              Log in to reserve
            </LoginLink>
          </Button>
        )}

        {state?.error && (
          <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
        )}

        <p className="text-center text-sm text-muted-foreground">
          You won&apos;t be charged – this is a demo.
        </p>

        {nights > 0 && (
          <div className="flex flex-col gap-y-3 border-t pt-4">
            <div className="flex justify-between text-muted-foreground">
              <span className="underline">{formatPrice(price)} x {plural(nights, "night")}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default ReservationCard
