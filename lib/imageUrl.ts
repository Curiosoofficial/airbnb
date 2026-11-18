// Baut die öffentliche URL eines Bildes im Supabase-Bucket "images".
// Früher war hier die Projekt-URL des alten Supabase-Projekts fest eingetragen,
// deshalb gingen alle Bilder kaputt, sobald dieses Projekt weg war.
export function getImageUrl(path: string | null | undefined) {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");

  if (!base || !path) return "/placeholder-home.svg";

  return `${base}/storage/v1/object/public/images/${path}`;
}
