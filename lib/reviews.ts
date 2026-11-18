import "server-only";
import prisma from "@/db/db";

export type RatingSummary = { average: number; count: number };

// Durchschnitt und Anzahl Bewertungen für mehrere Inserate in EINER Abfrage
// (groupBy statt einer Abfrage pro Karte, sonst N+1-Problem auf der Startseite)
export async function getRatings(homeIds: string[]) {
  const ratings = new Map<string, RatingSummary>();
  if (homeIds.length === 0) return ratings;

  const rows = await prisma.review.groupBy({
    by: ["homeId"],
    where: { homeId: { in: homeIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  for (const row of rows) {
    if (row.homeId) {
      ratings.set(row.homeId, { average: row._avg.rating ?? 0, count: row._count._all });
    }
  }
  return ratings;
}
