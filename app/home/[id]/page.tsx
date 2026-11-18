import AddToFavoriteButton from "@/components/AddToFavoriteButton";
import CategoryShowcase from "@/components/CategoryShowcase";
import DeleteFromFavoriteButton from "@/components/DeleteFromFavoriteButton";
import HomeMap from "@/components/HomeMap";
import ReservationCard from "@/components/ReservationCard";
import ShareButton from "@/components/ShareButton";
import Stars from "@/components/Stars";
import { Separator } from "@/components/ui/separator";
import { amenities } from "@/constants/amenities";
import prisma from "@/db/db";
import { addToFavorite, deleteFromFavorite } from "@/lib/actions/actions";
import { dateKeyToDb, dbToDateKey, toDateKey } from "@/lib/dates";
import { formatRating, plural } from "@/lib/format";
import { getCountryByValue } from "@/lib/getCountries";
import { getImageUrl } from "@/lib/imageUrl";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { format } from "date-fns";
import { Heart, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

// `cache`: generateMetadata und die Seite brauchen dieselben Daten.
// So geht trotzdem nur EINE Abfrage an die Datenbank.
const getData = cache(async (homeId: string) => {
  const data = await prisma.home.findUnique({
    where: {
      id: homeId,
    },
    select: {
      id: true,
      photo: true,
      description: true,
      guests: true,
      bedrooms: true,
      bathrooms: true,
      title: true,
      categoryName: true,
      price: true,
      country: true,
      city: true,
      latitude: true,
      longitude: true,
      amenities: true,
      addedLocation: true,
      userId: true,
      User: {
        select: {
            id: true,
            ProfileImage: true,
            firstName: true,
            createdAt: true,
        }
      },
      // Nur Buchungen, die noch nicht vorbei sind: für die gesperrten Tage im Kalender
      Reservation: {
        where: {
          endDate: { gt: dateKeyToDb(toDateKey(new Date())) },
        },
        select: {
          startDate: true,
          endDate: true,
        },
      },
      Review: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          User: { select: { firstName: true, ProfileImage: true } },
        },
      },
      _count: { select: { Review: true } },
    },
  });

  return data;
});

async function getRatingAverage(homeId: string) {
  const result = await prisma.review.aggregate({
    where: { homeId },
    _avg: { rating: true },
  });
  return result._avg.rating;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getData(id);
  const country = getCountryByValue(data?.country ?? "");

  return {
    title: data?.title ? `${data.title} · ${data.city ? `${data.city}, ` : ""}${country?.label ?? ""} | Airbnb-Klon` : "Airbnb-Klon",
    description: data?.description ?? undefined,
  };
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data = await getData(id);

  // Unbekannte ID oder halb fertiges Inserat: saubere 404-Seite
  if (!data || !data.addedLocation) {
    notFound();
  }

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const [average, favorite] = await Promise.all([
    getRatingAverage(data.id),
    user ? prisma.favorite.findFirst({ where: { homeId: data.id, userId: user.id }, select: { id: true } }) : null,
  ]);

  const country = getCountryByValue(data.country as string);
  const place = [data.city, country?.label].filter(Boolean).join(", ");
  const hostSince = data.User?.createdAt.getFullYear();
  const reviewCount = data._count.Review;
  const offered = amenities.filter((amenity) => data.amenities.includes(amenity.id));
  const pathName = `/home/${data.id}`;

  return (
    <div className="container mx-auto px-5 lg:px-10 my-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-y-2">
        <div>
          <h1 className="font-medium text-2xl">{data.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-1 text-sm">
            {reviewCount > 0 && average ? (
              <a href="#reviews" className="flex items-center gap-x-1 font-medium underline">
                <Star className="size-3.5 fill-foreground"/> {formatRating(average)} · {plural(reviewCount, "review")}
              </a>
            ) : (
              <span className="flex items-center gap-x-1 font-medium"><Star className="size-3.5 fill-foreground"/> New</span>
            )}
            <span className="text-muted-foreground">·</span>
            <span className="font-medium underline">{country?.flag} {place}</span>
          </p>
        </div>

        {/* Teilen und Merken, wie oben rechts bei Airbnb */}
        <div className="flex items-center">
          <ShareButton title={data.title ?? "Airbnb"}/>
          {!user ? (
            <a
              href={`/api/auth/login?post_login_redirect_url=${encodeURIComponent(`/api/auth/creation?next=${pathName}`)}`}
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium underline hover:bg-muted"
            >
              <Heart className="mr-2 size-4"/> Save
            </a>
          ) : favorite ? (
            <form action={deleteFromFavorite}>
              <input type="hidden" name="favoriteId" value={favorite.id}/>
              <input type="hidden" name="pathName" value={pathName}/>
              <DeleteFromFavoriteButton/>
            </form>
          ) : (
            <form action={addToFavorite}>
              <input type="hidden" name="homeId" value={data.id}/>
              <input type="hidden" name="pathName" value={pathName}/>
              <AddToFavoriteButton/>
            </form>
          )}
        </div>
      </div>

      <div className="relative h-[550px] max-lg:h-[320px]">
        <Image
          alt={data.title ?? "Image of the home"}
          src={getImageUrl(data.photo)}
          fill
          priority
          sizes="(min-width: 1400px) 1300px, 100vw"
          className="rounded-xl h-full object-cover w-full"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-x-16 gap-y-10 mt-8">
        <div className="lg:col-span-2">
            <h3 className="text-xl font-medium">Entire home in {place}</h3>
            <p className="text-muted-foreground">
              {plural(data.guests ?? 1, "guest")} &middot; {plural(data.bedrooms ?? 1, "bedroom")} &middot; {plural(data.bathrooms ?? 1, "bathroom")}
            </p>

            <Link href={`/users/${data.User?.id}`} className="group flex items-center mt-6 w-fit">
                {/* Profilbilder kommen von beliebigen Hosts (Google, GitHub, Gravatar ...).
                    `unoptimized` lädt sie direkt, ohne Next-Bildoptimierung und Domain-Liste. */}
                <Image
                    src={data.User?.ProfileImage || "/profileImage.jpg"}
                    alt="Profile image"
                    width={44}
                    height={44}
                    unoptimized
                    className="rounded-full size-11 object-cover"
                />
                <div className="flex flex-col ml-4">
                    <h3 className="font-medium group-hover:underline">Hosted by {data.User?.firstName}</h3>
                    {hostSince && <p className="text-sm text-muted-foreground">Host since {hostSince}</p>}
                </div>
            </Link>
            <Separator className="my-5"/>

            <CategoryShowcase categoryName={data.categoryName as string} />

            <Separator className="my-5"/>

            <p className="text-muted-foreground whitespace-pre-line">{data.description}</p>

            {offered.length > 0 && (
              <>
                <Separator className="my-5"/>
                <h3 className="text-xl font-medium mb-4">What this place offers</h3>
                <ul className="grid gap-y-4 sm:grid-cols-2">
                  {offered.map((amenity) => (
                    <li key={amenity.id} className="flex items-center gap-x-4">
                      <amenity.icon className="size-6 shrink-0"/> {amenity.label}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <Separator className="my-5"/>

            <h3 className="text-xl font-medium mb-1">Where you&apos;ll be</h3>
            <p className="mb-4 text-muted-foreground">{place}</p>
            <HomeMap locationValue={data.country as string} latitude={data.latitude} longitude={data.longitude} />
        </div>

        <aside className="lg:sticky lg:top-28 h-fit">
          <ReservationCard
            homeId={data.id}
            price={data.price ?? 0}
            maxGuests={data.guests ?? 1}
            booked={data.Reservation.map((item) => ({
              start: dbToDateKey(item.startDate),
              end: dbToDateKey(item.endDate),
            }))}
            isOwner={!!user && user.id === data.userId}
            isLoggedIn={!!user}
            rating={average && reviewCount > 0 ? { average, count: reviewCount } : null}
          />
        </aside>
      </div>

      <Separator className="my-10"/>

      {/* Bewertungen */}
      <section id="reviews" className="scroll-mt-28">
        {reviewCount === 0 ? (
          <div>
            <h3 className="flex items-center gap-x-2 text-xl font-medium"><Star className="size-5 fill-foreground"/> No reviews yet</h3>
            <p className="mt-1 text-muted-foreground">Guests can review this home after their stay.</p>
          </div>
        ) : (
          <>
            <h3 className="flex items-center gap-x-2 text-2xl font-medium">
              <Star className="size-6 fill-foreground"/> {formatRating(average ?? 0)} · {plural(reviewCount, "review")}
            </h3>
            <ul className="mt-8 grid gap-x-16 gap-y-10 md:grid-cols-2">
              {data.Review.map((review) => (
                <li key={review.id}>
                  <div className="flex items-center gap-x-3">
                    <Image
                      src={review.User?.ProfileImage || "/profileImage.jpg"}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="size-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{review.User?.firstName || "Former guest"}</p>
                      <p className="flex items-center gap-x-2 text-sm text-muted-foreground">
                        <Stars rating={review.rating}/> · {format(review.createdAt, "MMMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-muted-foreground">{review.comment}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export default Page;
