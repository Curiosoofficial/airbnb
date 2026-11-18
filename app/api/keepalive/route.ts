import prisma from "@/db/db";
import { getSupabase } from "@/db/supabase";
import { NextResponse } from "next/server";

// Gratis-Projekte bei Supabase werden nach 7 Tagen ohne Aktivität pausiert,
// dann wäre die Live-Demo kaputt. Ein Vercel-Cron (siehe vercel.json) ruft
// diese Route einmal pro Tag auf und macht eine kleine Abfrage auf Datenbank
// und Storage. Die Route gibt keine Daten preis, nur "ok".
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.home.count();
    await getSupabase().storage.from("images").list("", { limit: 1 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
