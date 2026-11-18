import { getCountryByValue } from "@/lib/getCountries";
import { getImageUrl } from "@/lib/imageUrl";
import { formatPrice, formatRating } from "@/lib/format";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";

import AddToFavoriteButton from "./AddToFavoriteButton";
import { addToFavorite, deleteFromFavorite } from "@/lib/actions/actions";
import DeleteFromFavoriteButton from "./DeleteFromFavoriteButton";
import { Button } from "./ui/button";

interface IAppProps {
  imagePath: string;
  title?: string | null;
  description: string;
  location: string;
  city?: string | null;
  rating?: { average: number; count: number } | null;
  price: number;
  userId: string | undefined;
  isInFavoriteList: boolean;
  favoriteId: string;
  homeId: string;
  pathName: string;
}

const ListingCard = ({
  imagePath,
  title,
  description,
  location,
  city,
  rating,
  price,
  userId,
  isInFavoriteList,
  favoriteId,
  homeId,
  pathName,
}: IAppProps) => {
    const country = getCountryByValue(location);

  return (
    <div className="flex flex-col group">
      <div className="relative h-72 overflow-hidden rounded-xl">
        {/* Auch das Bild führt zum Inserat (vorher nur der Text darunter) */}
        <Link href={`/home/${homeId}`} aria-label={title ?? country?.label ?? "Open listing"}>
          <Image
            src={getImageUrl(imagePath)}
            alt={title ?? "Listing Image"}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="z-10 absolute top-2 right-2">
          {!userId ? (
            // Gäste sehen das Herz auch. Klick führt zum Login und danach zurück.
            <Button asChild variant="outline" size="icon" className="bg-primary-foreground">
              <a href={`/api/auth/login?post_login_redirect_url=${encodeURIComponent(`/api/auth/creation?next=${pathName}`)}`} aria-label="Log in to save">
                <Heart className="size-4"/>
              </a>
            </Button>
          ) : isInFavoriteList ? (
            <form action={deleteFromFavorite}>
              <input type="hidden" name="favoriteId" value={favoriteId}/>
              <input type="hidden" name="pathName" value={pathName}/>
              <DeleteFromFavoriteButton/>
            </form>
          ): (
            <form action={addToFavorite}>
              <input type="hidden" name="homeId" value={homeId}/>
              <input type="hidden" name="pathName" value={pathName}/>
              <AddToFavoriteButton/>
            </form>
          )}
        </div>
      </div>


      <Link href={`/home/${homeId}`} className="mt-3">
        <div className="flex items-start justify-between gap-x-2">
          <h3 className="font-medium text-base truncate">{country?.flag} {city ? `${city}, ` : ""}{country?.label}</h3>
          <span className="flex shrink-0 items-center gap-x-1 text-sm">
            <Star className="size-3 fill-foreground"/>
            {rating ? <>{formatRating(rating.average)} <span className="text-muted-foreground">({rating.count})</span></> : "New"}
          </span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-1">{title || description}</p>
        <p className="pt-1 text-muted-foreground"><span className="font-medium text-foreground">{formatPrice(price)}</span> night</p>
      </Link>
    </div>
  );
};

export default ListingCard;
