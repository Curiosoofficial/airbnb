-- Migration für bestehende Datenbanken (z. B. die Live-Demo).
-- Neue Installationen brauchen das nicht: `npm run db:push` legt direkt alles an.
--
-- Von Hand geschrieben, weil `prisma migrate diff` die Spalten guests/bedrooms/
-- bathrooms löschen und neu anlegen würde (Datenverlust). Hier werden die
-- vorhandenen Texte stattdessen in Zahlen umgewandelt.

-- 1) Gäste, Zimmer, Bäder: Text -> Zahl
ALTER TABLE "Home"
  ALTER COLUMN "guests"    TYPE INTEGER USING NULLIF("guests", '')::integer,
  ALTER COLUMN "bedrooms"  TYPE INTEGER USING NULLIF("bedrooms", '')::integer,
  ALTER COLUMN "bathrooms" TYPE INTEGER USING NULLIF("bathrooms", '')::integer;

-- 2) Registrierungsdatum für "Host since …"
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3) Favoriten verschwinden mit dem Inserat
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_homeId_fkey";
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4) Buchungen
CREATE TABLE IF NOT EXISTS "Reservation" (
    "id" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "homeId" TEXT,
    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Reservation_homeId_startDate_endDate_idx"
  ON "Reservation"("homeId", "startDate", "endDate");
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_homeId_fkey"
  FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5) Wie bei den anderen Tabellen: kein Zugriff über die öffentliche REST-API
ALTER TABLE "Reservation" ENABLE ROW LEVEL SECURITY;
