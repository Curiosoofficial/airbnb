import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

// Anzeige von 1 bis 5 Sternen (nur lesen). Zum Bewerten: StarPicker in ReviewForm.
const Stars = ({ rating, className }: { rating: number; className?: string }) => {
  return (
    <span className={cn("inline-flex items-center gap-x-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn("size-3", value <= Math.round(rating) ? "fill-foreground text-foreground" : "text-muted-foreground/40")}
          aria-hidden
        />
      ))}
    </span>
  )
}

export default Stars
