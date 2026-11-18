import prisma from "@/db/db";
import { findCountries } from "@/lib/countrySearch";
import { plural } from "@/lib/format";
import { getCountryByValue } from "@/lib/getCountries";
import { NextResponse, type NextRequest } from "next/server";

export type PlaceSuggestion =
  | { type: "city"; label: string; sublabel: string; where: string }
  | { type: "country"; label: string; sublabel: string; where: string; flag: string }
  | { type: "stay"; label: string; sublabel: string; href: string };

// Vorschläge für das "Where"-Feld der Suche, während man tippt:
// Orte aus den Inseraten, Länder (auch "Schweiz", "Suisse" ...) und passende Unterkünfte.
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60);

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const published = { addedCategory: true, addedDescription: true, addedLocation: true };
  const countries = findCountries(q, 4);

  const [cities, countryCounts, stays] = await Promise.all([
    prisma.home.groupBy({
      by: ["city", "country"],
      where: { ...published, city: { contains: q, mode: "insensitive" } },
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 4,
    }),
    countries.length > 0
      ? prisma.home.groupBy({
          by: ["country"],
          where: { ...published, country: { in: countries.map((c) => c.code) } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    prisma.home.findMany({
      where: { ...published, title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, city: true, country: true },
      take: 3,
    }),
  ]);

  const countrySuggestions = countries
    .map((country) => ({
      type: "country" as const,
      label: country.label,
      flag: country.flag,
      count: countryCounts.find((item) => item.country === country.code)?._count._all ?? 0,
      where: country.label,
    }))
    // Länder mit Inseraten zuerst
    .sort((a, b) => b.count - a.count);

  const withStays = countrySuggestions.filter((country) => country.count > 0);
  const hasOtherHits = cities.length + stays.length + withStays.length > 0;

  const suggestions: PlaceSuggestion[] = [
    ...cities
      .filter((item) => item.city)
      .map((item) => ({
        type: "city" as const,
        label: item.city as string,
        sublabel: `${getCountryByValue(item.country ?? "")?.label ?? ""} · ${plural(item._count._all, "stay")}`,
        where: item.city as string,
      })),
    // Länder ohne Inserat nur zeigen, wenn sonst nichts passt
    // (sonst landen bei "sant" Saint Helena und Co. in der Liste)
    ...(hasOtherHits ? withStays : countrySuggestions.slice(0, 2)).map(({ count, ...country }) => ({
      ...country,
      sublabel: count > 0 ? plural(count, "stay") : "No stays yet",
    })),
    ...stays.map((stay) => ({
      type: "stay" as const,
      label: stay.title ?? "Home",
      sublabel: [stay.city, getCountryByValue(stay.country ?? "")?.label].filter(Boolean).join(", "),
      href: `/home/${stay.id}`,
    })),
  ];

  return NextResponse.json(
    { suggestions },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
