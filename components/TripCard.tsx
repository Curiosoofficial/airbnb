import { cancelReservation } from "@/lib/actions/actions"
import { formatDateRange, countNights } from "@/lib/dates"
import { formatPrice, plural } from "@/lib/format"
import { getCountryByValue } from "@/lib/getCountries"
import { getImageUrl } from "@/lib/imageUrl"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import ConfirmSubmit from "./ConfirmSubmit"

interface Props {
  reservationId: string
  homeId: string
  title: string
  photo: string | null
  country: string
  hostName: string
  startKey: string
  endKey: string
  guests: number
  totalPrice: number
  canCancel: boolean
  highlight?: boolean
}

const TripCard = ({ reservationId, homeId, title, photo, country, hostName, startKey, endKey, guests, totalPrice, canCancel, highlight }: Props) => {
  const countryInfo = getCountryByValue(country)
  const nights = countNights(startKey, endKey)

  return (
    <div className={cn("flex flex-col sm:flex-row gap-5 rounded-xl border p-4", highlight && "border-2 border-primary")}>
      <Link href={`/home/${homeId}`} className="relative h-48 sm:h-36 sm:w-52 shrink-0">
        <Image
          src={getImageUrl(photo)}
          alt={title}
          fill
          sizes="(min-width: 640px) 208px, 100vw"
          className="rounded-lg object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-y-1">
        <Link href={`/home/${homeId}`} className="font-medium hover:underline">{title}</Link>
        <p className="text-sm text-muted-foreground">
          {countryInfo?.flag} {countryInfo?.label} &middot; Hosted by {hostName}
        </p>
        <p className="mt-2 font-medium">{formatDateRange(startKey, endKey)}</p>
        <p className="text-sm text-muted-foreground">
          {plural(nights, "night")} &middot; {plural(guests, "guest")} &middot; {formatPrice(totalPrice)} total
        </p>

        {canCancel && (
          <form action={cancelReservation} className="mt-auto pt-3">
            <input type="hidden" name="reservationId" value={reservationId}/>
            <ConfirmSubmit label="Cancel reservation" confirmLabel="Yes, cancel" question="Cancel this trip?"/>
          </form>
        )}
      </div>
    </div>
  )
}

export default TripCard
