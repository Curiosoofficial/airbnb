import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Der Client wird erst beim ersten Gebrauch erstellt (nicht schon beim Import).
// Sonst bricht `next build` ab, sobald die Env-Variablen fehlen.
let client: SupabaseClient | null = null;

export function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  // Der Upload läuft nur auf dem Server (Server Action). Darum darf hier der
  // geheime Service-Key stehen: Er umgeht Row Level Security, und es braucht
  // keine Upload-Regel für anonyme Nutzer. Er landet nie im Browser, weil die
  // Variable kein NEXT_PUBLIC_-Präfix hat.
  const serverKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url || !serverKey) {
    throw new Error(
      "SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt. Siehe .env.example."
    );
  }

  client = createClient(url, serverKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
