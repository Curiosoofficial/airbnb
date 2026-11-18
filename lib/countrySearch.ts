import "server-only";
import countries from "world-countries";

// Nur auf dem Server: das volle Länderpaket mit Übersetzungen und Schreibweisen.
// So findet die Suche "Schweiz", "Suisse", "Switzerland" oder "CH" gleichermassen.

// Kleinbuchstaben ohne Akzente: "Österreich" -> "osterreich", "Côte" -> "cote"
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const searchIndex = countries.map((country) => {
  const names = new Set<string>([
    country.name.common,
    country.name.official,
    ...country.altSpellings,
    ...Object.values(country.translations).flatMap((t) => [t.common, t.official]),
  ]);
  return {
    code: country.cca2,
    label: country.name.common,
    flag: country.flag,
    names: [...names].map(normalize),
  };
});

// Länder, deren Name (in irgendeiner Sprache) mit der Eingabe beginnt
// oder bei längeren Eingaben sie enthält
export function findCountries(query: string, limit = 5) {
  const q = normalize(query);
  if (q.length < 2) return [];

  const exactCode = q.length === 2 ? searchIndex.filter((c) => c.code.toLowerCase() === q) : [];
  const starts = searchIndex.filter((c) => c.names.some((name) => name.startsWith(q)));
  const contains = q.length >= 4 ? searchIndex.filter((c) => c.names.some((name) => name.includes(q))) : [];

  const seen = new Set<string>();
  return [...exactCode, ...starts, ...contains]
    .filter((c) => (seen.has(c.code) ? false : (seen.add(c.code), true)))
    .slice(0, limit)
    .map(({ code, label, flag }) => ({ code, label, flag }));
}
