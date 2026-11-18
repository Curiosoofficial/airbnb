"use client"

import { createReview } from "@/lib/actions/actions"
import type { FormState } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle2, Loader2, Star } from "lucide-react"
import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

const LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Amazing"]

const SubmitReview = () => {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin"/> : "Post review"}
    </Button>
  )
}

// Bewertung nach einem Aufenthalt: 1 bis 5 Sterne plus Text.
// Die Sterne sind echte Radio-Buttons (mit Tastatur bedienbar), nur anders gestylt.
const ReviewForm = ({ reservationId }: { reservationId: string }) => {
  const [state, formAction] = useActionState<FormState, FormData>(createReview, null)
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  if (state?.ok) {
    return (
      <p className="flex items-center gap-x-2 text-sm text-green-700">
        <CheckCircle2 className="size-4"/> Thanks for your review!
      </p>
    )
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Star className="mr-2 size-3.5"/> Leave a review
      </Button>
    )
  }

  const shown = hover || rating

  return (
    <form action={formAction} className="flex flex-col gap-y-3 rounded-lg border p-3">
      <input type="hidden" name="reservationId" value={reservationId}/>

      <fieldset className="flex items-center gap-x-3">
        <legend className="sr-only">Rating</legend>
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
              />
              <Star
                className={cn(
                  "size-6 transition-colors peer-focus-visible:rounded peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                  value <= shown ? "fill-primary text-primary" : "text-muted-foreground"
                )}
              />
              <span className="sr-only">{value} {value === 1 ? "star" : "stars"}</span>
            </label>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{LABELS[shown]}</span>
      </fieldset>

      <Textarea name="comment" rows={3} maxLength={1000} required minLength={10} placeholder="How was your stay? What did you like?"/>

      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-x-2">
        <SubmitReview/>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  )
}

export default ReviewForm
