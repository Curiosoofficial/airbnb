import FiltersDialog from "@/components/FiltersDialog";
import ListingCard from "@/components/ListingCard";
import ListingsMapLoader from "@/components/ListingsMapLoader";
import MapFilterItems from "@/components/MapFilterItems";
import NoItems from "@/components/NoItems";
import SkeletonHome from "@/components/SkeletonHome";
import { cleanAmenities } from "@/constants/amenities";
import { categoryItems } from "@/constants/categoryItems";
import prisma from "@/db/db";
import { findCountries } from "@/lib/countrySearch";
import { dateKeyToDb, formatDateRange, fromDateKey } from "@/lib/dates";
import { formatPrice, plural } from "@/lib/format";
import { getCountryByValue } from "@/lib/getCountries";
import { getImageUrl } from "@/lib/imageUrl";
import { getRatings } from "@/lib/reviews";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { Prisma } from "@prisma/client";
import { List, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type RawSearchParams = Record<string, string | string[] | undefined>;

type Sort = "price_asc" | "price_desc" | "rating" | undefined;

type Search = {
  filter?: string;
  where?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  sort: Sort;
};

const PUBLISHED = { addedCategory: true, addedDescription: true, addedLocation: true };

function readParam(params: RawSearchParams, key: string) {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

function readNumber(params: RawSearchParams, key: string, min: number, max: number) {
  const value = Number(readParam(params, key));
  return Number.isInteger(value) && value >= min && value <= max ? value : undefined;
}

// URL-Parameter kommen vom Benutzer und können alles enthalten.
// Nur gültige Werte werden zum Filter, der Rest wird ignoriert.
function parseSearch(params: RawSearchParams): Search {
  const filterParam = readParam(params, "filter");
  const filter = categoryItems.some((item) => item.name === filterParam) ? filterParam : undefined;
  const countryParam = readParam(params, "country");
  const country = countryParam && getCountryByValue(countryParam) ? countryParam : undefined;
  const where = readParam(params, "where")?.trim().slice(0, 60) || undefined;

  const checkInKey = readParam(params, "checkIn");
  const checkOutKey = readParam(params, "checkOut");
  const checkIn = fromDateKey(checkInKey);
  const checkOut = fromDateKey(checkOutKey);
  const validDates = checkIn && checkOut && checkOut > checkIn;

  const sortParam = readParam(params, "sort");
  const sort = sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "rating" ? sortParam : undefined;

  return {
    filter,
    where,
    country,
    checkIn: validDates ? checkInKey : undefined,
    checkOut: validDates ? checkOutKey : undefined,
    guests: readNumber(params, "guests", 2, 16),
    minPrice: readNumber(params, "minPrice", 1, 100000),
    maxPrice: readNumber(params, "maxPrice", 1, 100000),
    bedrooms: readNumber(params, "bedrooms", 1, 16),
    bathrooms: readNumber(params, "bathrooms", 1, 16),
    amenities: cleanAmenities(readParam(params, "amenities")?.split(",") ?? []),
    sort,
  };
}

function buildWhere(search: Search): Prisma.HomeWhereInput {
  // Freitext "Where": Ort, Titel oder Land (auch "Schweiz", "Suisse", "CH" ...)
  const countryCodes = search.where ? findCountries(search.where, 10).map((c) => c.code) : [];

  return {
    ...PUBLISHED,
    categoryName: search.filter,
    country: search.country,
    OR: search.where
      ? [
          { city: { contains: search.where, mode: "insensitive" } },
          { title: { contains: search.where, mode: "insensitive" } },
          ...(countryCodes.length > 0 ? [{ country: { in: countryCodes } }] : []),
        ]
      : undefined,
    // Seit guests eine Zahl ist (vorher Text), geht "mindestens N Gäste"
    guests: search.guests ? { gte: search.guests } : undefined,
    bedrooms: search.bedrooms ? { gte: search.bedrooms } : undefined,
    bathrooms: search.bathrooms ? { gte: search.bathrooms } : undefined,
    price: search.minPrice || search.maxPrice ? { gte: search.minPrice, lte: search.maxPrice } : undefined,
    // Alle gewählten Ausstattungen müssen vorhanden sein
    amenities: search.amenities.length > 0 ? { hasEvery: search.amenities } : undefined,
    // Nur Unterkünfte ohne Buchung, die sich mit dem gewünschten Zeitraum überschneidet
    Reservation:
      search.checkIn && search.checkOut
        ? {
            none: {
              startDate: { lt: dateKeyToDb(search.checkOut) },
              endDate: { gt: dateKeyToDb(search.checkIn) },
            },
          }
        : undefined,
  };
}

async function getData({ search, userId }: { search: Search; userId: string | undefined }) {
  const data = await prisma.home.findMany({
    where: buildWhere(search),
    select: {
      photo: true,
      id: true,
      title: true,
      price: true,
      description: true,
      country: true,
      city: true,
      latitude: true,
      longitude: true,
      Favorite: {
        // Gäste: keine Favoriten laden. Vorher landeten hier die Favoriten
        // ALLER User (where mit undefined = kein Filter) im HTML.
        where: {
          userId: userId ?? "-",
        },
        select: { id: true },
      },
    },
    orderBy:
      search.sort === "price_asc"
        ? { price: "asc" }
        : search.sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" },
  });

  const ratings = await getRatings(data.map((item) => item.id));
  const withRatings = data.map((item) => ({ ...item, rating: ratings.get(item.id) ?? null }));

  // "Top rated": nach Schnitt, bei Gleichstand nach Anzahl Bewertungen
  if (search.sort === "rating") {
    withRatings.sort(
      (a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0)
    );
  }

  return withRatings;
}

// Seit Next 15/16 ist `searchParams` ein Promise.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const search = parseSearch(params);
  const view = readParam(params, "view") === "map" ? "map" : "list";

  // Günstigstes und teuerstes Inserat als Platzhalter im Filter-Dialog
  const bounds = await prisma.home.aggregate({ where: PUBLISHED, _min: { price: true }, _max: { price: true } });
  const priceBounds = { min: bounds._min.price ?? 0, max: bounds._max.price ?? 0 };

  // Link zum Umschalten Liste/Karte: alle anderen Parameter bleiben erhalten
  const toggleParams = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => entry[0] !== "view" && typeof entry[1] === "string")
  );
  if (view === "list") toggleParams.set("view", "map");
  const toggleQuery = toggleParams.toString();

  return (
    <div className="container mx-auto px-5 lg:px-10 pb-28">
      {/* MapFilterItems und FiltersDialog lesen die URL mit useSearchParams()
          und brauchen darum eine eigene Suspense-Grenze */}
      <div className="flex items-center gap-x-6">
        <div className="min-w-0 flex-1">
          <Suspense fallback={<div className="h-[68px]" />}>
            <MapFilterItems />
          </Suspense>
        </div>
        <div className="mt-5 hidden sm:block">
          <Suspense fallback={null}>
            <FiltersDialog priceBounds={priceBounds}/>
          </Suspense>
        </div>
      </div>
      <div className="mt-4 sm:hidden">
        <Suspense fallback={null}>
          <FiltersDialog priceBounds={priceBounds}/>
        </Suspense>
      </div>

      <Suspense fallback={<SkeletonHome />} key={JSON.stringify(search) + view}>
        <ShowItems search={search} view={view} />
      </Suspense>

      {/* Schwebender Umschalter wie bei Airbnb */}
      <Link
        href={toggleQuery ? `/?${toggleQuery}` : "/"}
        scroll={false}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-x-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg transition-transform hover:scale-105"
      >
        {view === "list" ? <>Show map <MapIcon className="size-4"/></> : <>Show list <List className="size-4"/></>}
      </Link>
    </div>
  );
}

async function ShowItems({ search, view }: { search: Search; view: "list" | "map" }) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData({ search, userId: user?.id });

  const isSearching = !!(search.where || search.country || search.checkIn || search.guests);
  const filterCount = [search.minPrice, search.maxPrice, search.bedrooms, search.bathrooms, search.sort].filter(Boolean).length + search.amenities.length;
  const country = search.country ? getCountryByValue(search.country) : undefined;
  const placeLabel = search.where ?? (country ? `${country.flag} ${country.label}` : undefined);

  // z. B. "2 stays in Santorini · Mar 3 – 8, 2027 · 4 guests · under $300"
  const summary = [
    `${plural(data.length, "stay")}${placeLabel ? ` in ${placeLabel}` : ""}`,
    search.checkIn && search.checkOut && formatDateRange(search.checkIn, search.checkOut),
    search.guests && plural(search.guests, "guest"),
    search.minPrice && search.maxPrice
      ? `${formatPrice(search.minPrice)}–${formatPrice(search.maxPrice)}`
      : search.maxPrice
        ? `under ${formatPrice(search.maxPrice)}`
        : search.minPrice
          ? `from ${formatPrice(search.minPrice)}`
          : null,
    filterCount > 0 && plural(filterCount, "filter"),
  ].filter(Boolean).join(" · ");

  // "Clear all" entfernt Suche und Filter, Kategorie und Ansicht bleiben
  const clearParams = new URLSearchParams();
  if (search.filter) clearParams.set("filter", search.filter);
  if (view === "map") clearParams.set("view", "map");
  const clearQuery = clearParams.toString();

  return (
    <>
      {(isSearching || filterCount > 0) && (
        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-medium">{summary}</p>
          <Link href={clearQuery ? `/?${clearQuery}` : "/"} className="text-sm underline text-muted-foreground hover:text-foreground">
            Clear all
          </Link>
        </div>
      )}

      {data.length === 0 ? (
          isSearching || filterCount > 0 ? (
            <NoItems title="No homes match your search" description="Try other dates, another place or fewer filters."/>
          ) : (
            <NoItems title="Sorry, there is no listing for this category" description="Please check another category or create your own"/>
          )
      ) : view === "map" ? (
        <div className="mt-8">
          <ListingsMapLoader
            listings={data.map((item) => ({
              id: item.id,
              title: item.title ?? "Home",
              price: item.price ?? 0,
              country: item.country ?? "",
              latitude: item.latitude,
              longitude: item.longitude,
              imageUrl: getImageUrl(item.photo),
            }))}
          />
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
        {data.map((item) => (
          <ListingCard
            key={item.id}
            title={item.title}
            description={item.description as string}
            imagePath={item.photo as string}
            location={item.country as string}
            city={item.city}
            rating={item.rating}
            price={item.price as number}
            userId={user?.id}
            favoriteId={item.Favorite[0]?.id}
            isInFavoriteList={item.Favorite.length > 0}
            homeId={item.id}
            pathName="/"
          />
        ))}
      </div>
      )}
    </>
  );
}
