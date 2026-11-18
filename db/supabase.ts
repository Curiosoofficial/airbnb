import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Der Client wird erst beim ersten Gebrauch erstellt (nicht schon beim Import).
// Sonst bricht `next build` ab, sobald die Env-Variablen fehlen.
let client: SupabaseClient | null = null;

export function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "SUPABASE_URL oder SUPABASE_ANON_KEY fehlt. Siehe .env.example."
    );
  }

  client = createClient(url, anonKey);
  return client;
}
