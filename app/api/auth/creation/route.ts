import prisma from "@/db/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  if (!user || user === null || !user.id) {
    return NextResponse.redirect(new URL("/api/auth/login", request.url));
  }

  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: user.email ?? "",
        firstName: user.given_name ?? "",
        lastName: user.family_name ?? "",
        id: user.id,
        ProfileImage:
          user.picture ?? `https://avatar.vercel.sh/${user.given_name}`,
      },
    });
  }

  // Relativ zur aktuellen Domain weiterleiten. Vorher stand hier fest
  // "http://localhost:3000/", das funktioniert auf Vercel nicht.
  // `next`: Seite, auf der man vor dem Login war (z. B. ein Inserat beim Buchen).
  // Nur eigene Pfade wie "/home/123" erlaubt, sonst könnte jemand einen Link
  // bauen, der nach dem Login auf eine fremde Seite weiterleitet (Open Redirect).
  const next = request.nextUrl.searchParams.get("next");
  const target = next && /^\/(?!\/)/.test(next) && !next.includes("\\") ? next : "/";

  return NextResponse.redirect(new URL(target, request.url));
}
