import { differenceInCalendarDays, format, isValid } from "date-fns";

// Buchungen arbeiten mit reinen Kalendertagen (ohne Uhrzeit). Zwischen Browser,
// Server und Datenbank reisen sie als Text "YYYY-MM-DD". So verschiebt keine
// Zeitzone einen Tag (z. B. 1. März 00:00 in Zürich = 28. Februar 23:00 UTC).

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

// Date (lokale Zeit) -> "YYYY-MM-DD"
export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

// "YYYY-MM-DD" -> Date (lokale Zeit, 00:00). Ungültige Eingaben -> undefined
export function fromDateKey(key: string | null | undefined) {
  const match = key ? DATE_KEY.exec(key) : null;
  if (!match) return undefined;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  // Fängt Daten wie "2027-02-31" ab (würde sonst zum 3. März)
  return isValid(date) && toDateKey(date) === key ? date : undefined;
}

// Für Prisma/Postgres (@db.Date): Mitternacht UTC
export function dateKeyToDb(key: string) {
  return new Date(`${key}T00:00:00.000Z`);
}

// Aus der Datenbank (@db.Date kommt als Mitternacht UTC) -> "YYYY-MM-DD"
export function dbToDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function countNights(startKey: string, endKey: string) {
  const start = fromDateKey(startKey);
  const end = fromDateKey(endKey);
  if (!start || !end) return 0;
  return differenceInCalendarDays(end, start);
}

// "Mar 3 – 8, 2027" bzw. "Mar 30 – Apr 2, 2027"
export function formatDateRange(startKey: string, endKey: string) {
  const start = fromDateKey(startKey);
  const end = fromDateKey(endKey);
  if (!start || !end) return "";

  if (start.getFullYear() !== end.getFullYear()) {
    return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`;
  }
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}
