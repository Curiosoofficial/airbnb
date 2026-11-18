import ListingCard from "@/components/ListingCard";
import ListingsMapLoader from "@/components/ListingsMapLoader";
import MapFilterItems from "@/components/MapFilterItems";
import NoItems from "@/components/NoItems";
import SkeletonHome from "@/components/SkeletonHome";
import { categoryItems } from "@/constants/categoryItems";
import prisma from "@/db/db";
import { dateKeyToDb, formatDateRange, fromDateKey } from "@/lib/dates";
import { plural } from "@/lib/format";
import { getCountryByValue } from "@/lib/getCountries";
import { getImageUrl } from "@/lib/imageUrl";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { List, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type RawSearchParams = {
  filter?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  view?: string;
};

type Search = {
  filter?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

// URL-Parameter kommen vom Benutzer und können alles enthalten.
// Nur gültige Werte werden zum Filter, der Rest wird ignoriert.
function parseSearch(params: RawSearchParams): Search {
  const filter = categoryItems.some((item) => item.name === params.filter) ? params.filter : undefined;
  const country = params.country && getCountryByValue(params.country) ? params.country : undefined;

  const checkIn = fromDateKey(params.checkIn);
  const checkOut = fromDateKey(params.checkOut);
  const validDates = checkIn && checkOut && checkOut > checkIn;

  const guests = Number(params.guests);

  return {
    filter,
    country,
    checkIn: validDates ? params.checkIn : undefined,
    checkOut: validDates ? params.checkOut : undefined,
    guests: Number.isInteger(guests) && guests > 1 && guests <= 16 ? guests : undefined,
  };
}

async function getData({ search, userId }: { search: Search; userId: string | undefined }) {
  const data = await prisma.home.findMany({
    where: {
      addedCategory: true,
      addedDescription: true,
      addedLocation: true,
      categoryName: search.filter,
      country: search.country,
      // Seit guests eine Zahl ist (vorher Text), geht "mindestens N Gäste"
      guests: search.guests ? { gte: search.guests } : undefined,
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
    },
    select: {
      photo: true,
      id: true,
      title: true,
      price: true,
      description: true,
      country: true,
      Favorite: {
        // Gäste: keine Favoriten laden. Vorher landeten hier die Favoriten
        // ALLER User (where mit undefined = kein Filter) im HTML.
        where: {
          userId: userId ?? "-",
        },
        select: { id: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

// Seit Next 15/16 ist `searchParams` ein Promise.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const search = parseSearch(params);
  const view = params.view === "map" ? "map" : "list";

  // Link zum Umschalten Liste/Karte: alle anderen Parameter bleiben erhalten
  const toggleParams = new URLSearchParams(
    Object.entries(params).filter(([key, value]) => key !== "view" && typeof value === "string")
  );
  if (view === "list") toggleParams.set("view", "map");
  const toggleQuery = toggleParams.toString();

  return (
    <div className="container mx-auto px-5 lg:px-10 pb-28">
      {/* MapFilterItems liest die URL mit useSearchParams() und braucht darum
          eine eigene Suspense-Grenze */}
      <Suspense fallback={<div className="h-[68px]" />}>
        <MapFilterItems />
      </Suspense>
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

  const isSearching = !!(search.country || search.checkIn || search.guests);
  const country = search.country ? getCountryByValue(search.country) : undefined;
  // z. B. "2 stays in 🇮🇹 Italy · Mar 3 – 8, 2027 · 4 guests"
  const summary = [
    `${plural(data.length, "stay")}${country ? ` in ${country.flag} ${country.label}` : ""}`,
    search.checkIn && search.checkOut && formatDateRange(search.checkIn, search.checkOut),
    search.guests && plural(search.guests, "guest"),
  ].filter(Boolean).join(" · ");

  // "Clear search" entfernt nur die Suche, Kategorie und Ansicht bleiben
  const clearParams = new URLSearchParams();
  if (search.filter) clearParams.set("filter", search.filter);
  if (view === "map") clearParams.set("view", "map");
  const clearQuery = clearParams.toString();

  return (
    <>
      {isSearching && (
        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-medium">{summary}</p>
          <Link href={clearQuery ? `/?${clearQuery}` : "/"} className="text-sm underline text-muted-foreground hover:text-foreground">
            Clear search
          </Link>
        </div>
      )}

      {data.length === 0 ? (
          isSearching ? (
            <NoItems title="No homes match your search" description="Try other dates, a different country or fewer guests."/>
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
