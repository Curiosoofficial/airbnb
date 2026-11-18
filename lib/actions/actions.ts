"use server";

import prisma from "@/db/db";
import { getSupabase } from "@/db/supabase";
import { cleanAmenities } from "@/constants/amenities";
import { categoryItems } from "@/constants/categoryItems";
import { countNights, dateKeyToDb, dbToDateKey, fromDateKey, toDateKey } from "@/lib/dates";
import { getCountryByValue } from "@/lib/getCountries";
import type { FormState } from "@/lib/types";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Vercel erlaubt max. 4.5 MB pro Request
const MAX_COUNT = 16; // Gäste, Zimmer, Bäder
const MAX_NIGHTS = 28;

// Server Actions sind öffentliche Endpunkte: Jeder kann sie mit beliebigen
// Formulardaten aufrufen. Deshalb kommt die User-ID immer aus der Session,
// nie aus einem (manipulierbaren) Formularfeld.
// `returnTo`: Nach dem Login geht es zurück auf diese Seite statt auf "/".
async function requireUserId(returnTo?: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    const afterLogin = returnTo
      ? `/api/auth/creation?next=${encodeURIComponent(returnTo)}`
      : "/api/auth/creation";
    redirect(
      `/api/auth/login?post_login_redirect_url=${encodeURIComponent(afterLogin)}`
    );
  }

  return user.id;
}

// ─── Hilfsfunktionen für Formulare ──────────────────────────────────────────

function readText(formData: FormData, name: string, maxLength: number) {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 && value.length <= maxLength ? value : null;
}

// Ganze Zahl zwischen min und max, sonst null
function readInt(formData: FormData, name: string, min: number, max: number) {
  const value = Number(formData.get(name));
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function isValidCategory(name: string | null) {
  return categoryItems.some((item) => item.name === name);
}

// Ort aus der Adresssuche (LocationPicker). Koordinaten werden auf zwei
// Nachkommastellen gerundet (ca. 1 km): Die genaue Adresse eines Gastgebers
// soll nicht in der Datenbank und nicht öffentlich auf der Karte stehen.
function readLocation(formData: FormData) {
  const city = readText(formData, "city", 80);
  const country = String(formData.get("countryValue") ?? "");
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));

  const valid =
    city &&
    getCountryByValue(country) &&
    formData.get("latitude") !== "" &&
    Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
    Number.isFinite(longitude) && Math.abs(longitude) <= 180;

  if (!valid) return null;

  return {
    city,
    country,
    latitude: Math.round(latitude * 100) / 100,
    longitude: Math.round(longitude * 100) / 100,
  };
}

function readAmenities(formData: FormData) {
  return cleanAmenities(formData.getAll("amenities").map(String));
}

async function uploadImage(imageFile: File) {
  if (!imageFile.type.startsWith("image/")) {
    throw new Error("Die Datei ist kein Bild.");
  }

  if (imageFile.size > MAX_IMAGE_BYTES) {
    throw new Error("Das Bild ist grösser als 4 MB.");
  }

  // Eindeutiger, sicherer Dateiname: Umlaute oder Leerzeichen im
  // Originalnamen führen sonst zu "Invalid key" bei Supabase.
  const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;

  const { data, error } = await getSupabase()
    .storage.from("images")
    .upload(fileName, imageFile, {
      cacheControl: "2592000",
      contentType: imageFile.type,
    });

  if (error || !data?.path) {
    throw new Error(`Error uploading image: ${error?.message ?? "no path"}`);
  }

  return data.path;
}

// Altes Bild löschen. Schlägt das fehl, ist das kein Grund, die Aktion abzubrechen.
async function removeImage(path: string | null) {
  if (!path) return;
  await getSupabase().storage.from("images").remove([path]).catch(() => null);
}

// ─── Inserat erstellen (3 Schritte) ─────────────────────────────────────────

export async function createAirbnbHome() {
  const userId = await requireUserId();

  const data = await prisma.home.findFirst({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (data === null) {
    const data = await prisma.home.create({
      data: {
        userId: userId,
      },
    });

    return redirect(`/create/${data.id}/structure`);
  } else if (
    !data.addedCategory &&
    !data.addedDescription &&
    !data.addedLocation
  ) {
    return redirect(`/create/${data.id}/structure`);
  } else if (data.addedCategory && !data.addedDescription) {
    return redirect(`/create/${data.id}/description`);
  } else if (
    data.addedCategory &&
    data.addedDescription &&
    !data.addedLocation
  ) {
    return redirect(`/create/${data.id}/location`);
  } else if (data.addedCategory && data.addedDescription && data.addedLocation) {
    const data = await prisma.home.create({
      data: {
        userId: userId,
      },
    });

    return redirect(`/create/${data.id}/structure`);
  }
}

export async function createCategoryPage(formData: FormData) {
  const userId = await requireUserId();
  const categoryName = formData.get("categoryName") as string;
  const homeId = formData.get("homeId") as string;

  // Ohne gültige Kategorie zurück zum Schritt (sonst crasht später die Detailseite)
  if (!isValidCategory(categoryName)) {
    return redirect(`/create/${homeId}/structure`);
  }

  // `userId` im where: Nur der Besitzer darf sein Inserat bearbeiten
  await prisma.home.update({
    where: {
      id: homeId,
      userId: userId,
    },
    data: {
      categoryName: categoryName,
      addedCategory: true,
    },
  });

  return redirect(`/create/${homeId}/description`);
}

export async function createDescriptionPage(formData: FormData) {
  const userId = await requireUserId();
  const homeId = formData.get("homeId") as string;
  const title = readText(formData, "title", 80);
  const description = readText(formData, "description", 1000);
  const price = readInt(formData, "price", 10, 10000);
  const guests = readInt(formData, "guest", 1, MAX_COUNT);
  const bedrooms = readInt(formData, "room", 1, MAX_COUNT);
  const bathrooms = readInt(formData, "bathroom", 1, MAX_COUNT);
  const imageFile = formData.get("image") as File | null;

  if (!title || !description || !price || !guests || !bedrooms || !bathrooms) {
    throw new Error("Bitte alle Felder korrekt ausfüllen.");
  }

  if (!imageFile || imageFile.size === 0) {
    throw new Error("Bitte ein Bild auswählen.");
  }

  const photo = await uploadImage(imageFile);

  await prisma.home.update({
    where: {
      id: homeId,
      userId: userId,
    },
    data: {
      title,
      description,
      price,
      bedrooms,
      bathrooms,
      guests,
      photo,
      amenities: readAmenities(formData),
      addedDescription: true,
    },
  });

  return redirect(`/create/${homeId}/location`);
}

export async function createLocationPage(formData: FormData) {
  const userId = await requireUserId();
  const homeId = formData.get("homeId") as string;
  const location = readLocation(formData);

  // Kein Ort aus der Liste gewählt: zurück zum Schritt
  if (!location) {
    return redirect(`/create/${homeId}/location`);
  }

  await prisma.home.update({
    where: {
      id: homeId,
      userId: userId,
    },
    data: {
      addedLocation: true,
      ...location,
    },
  });

  revalidatePath("/");
  return redirect(`/home/${homeId}`);
}

// ─── Inserat bearbeiten und löschen ─────────────────────────────────────────

export async function updateHome(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const homeId = String(formData.get("homeId") ?? "");
  const userId = await requireUserId(`/home/${homeId}/edit`);

  const home = await prisma.home.findUnique({
    where: { id: homeId, userId },
    select: { photo: true },
  });

  if (!home) {
    return { error: "Listing not found." };
  }

  const title = readText(formData, "title", 80);
  const description = readText(formData, "description", 1000);
  const price = readInt(formData, "price", 10, 10000);
  const guests = readInt(formData, "guest", 1, MAX_COUNT);
  const bedrooms = readInt(formData, "room", 1, MAX_COUNT);
  const bathrooms = readInt(formData, "bathroom", 1, MAX_COUNT);
  const categoryName = String(formData.get("categoryName") ?? "");
  const location = readLocation(formData);
  const imageFile = formData.get("image") as File | null;

  if (!title || !description) {
    return { error: "Please add a title and a description." };
  }
  if (!price) {
    return { error: "The price must be between $10 and $10,000." };
  }
  if (!guests || !bedrooms || !bathrooms) {
    return { error: "Guests, rooms and bathrooms must be between 1 and 16." };
  }
  if (!isValidCategory(categoryName)) {
    return { error: "Please choose a category." };
  }
  if (!location) {
    return { error: "Please search for a place and pick it from the list." };
  }

  // Neues Bild ist optional. Ohne Auswahl bleibt das alte.
  let photo = home.photo;
  if (imageFile && imageFile.size > 0) {
    try {
      photo = await uploadImage(imageFile);
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  await prisma.home.update({
    where: { id: homeId, userId },
    data: {
      title,
      description,
      price,
      guests,
      bedrooms,
      bathrooms,
      categoryName,
      ...location,
      amenities: readAmenities(formData),
      photo,
    },
  });

  if (photo !== home.photo) {
    await removeImage(home.photo);
  }

  revalidatePath("/");
  revalidatePath(`/home/${homeId}`);
  revalidatePath("/my-homes");
  return redirect(`/home/${homeId}`);
}

export async function deleteHome(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = await requireUserId("/my-homes");
  const homeId = String(formData.get("homeId") ?? "");

  const home = await prisma.home.findUnique({
    where: { id: homeId, userId },
    select: { photo: true },
  });

  if (!home) {
    return { error: "Listing not found." };
  }

  // Gäste mit einer kommenden Buchung sollen nicht plötzlich ohne Unterkunft dastehen
  const upcoming = await prisma.reservation.count({
    where: { homeId, endDate: { gt: dateKeyToDb(toDateKey(new Date())) } },
  });

  if (upcoming > 0) {
    return {
      error: `This home has ${upcoming} upcoming reservation${upcoming === 1 ? "" : "s"} and can't be deleted.`,
    };
  }

  // Favoriten und alte Buchungen werden per ON DELETE CASCADE mitgelöscht
  await prisma.home.delete({ where: { id: homeId, userId } });
  await removeImage(home.photo);

  revalidatePath("/");
  revalidatePath("/my-homes");
  return { ok: true };
}

// ─── Favoriten ──────────────────────────────────────────────────────────────

export async function addToFavorite(formData: FormData) {
  const userId = await requireUserId();
  const homeId = formData.get("homeId") as string;
  const pathName = formData.get("pathName") as string;

  // Doppelklick soll keinen zweiten Favoriten anlegen
  const existing = await prisma.favorite.findFirst({
    where: { homeId, userId },
  });

  if (!existing) {
    await prisma.favorite.create({
      data: {
        homeId: homeId,
        userId: userId,
      },
    });
  }

  revalidatePath(pathName);
}

export async function deleteFromFavorite(formData: FormData) {
  const userId = await requireUserId();
  const favoriteId = formData.get("favoriteId") as string;
  const pathName = formData.get("pathName") as string;

  // deleteMany statt delete: wirft keinen Fehler, wenn der Eintrag schon weg ist
  await prisma.favorite.deleteMany({
    where: {
      id: favoriteId,
      userId: userId,
    },
  });

  revalidatePath(pathName);
}

// ─── Buchungen ──────────────────────────────────────────────────────────────

export async function createReservation(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const homeId = String(formData.get("homeId") ?? "");
  const userId = await requireUserId(`/home/${homeId}`);
  const startKey = String(formData.get("startDate") ?? "");
  const endKey = String(formData.get("endDate") ?? "");

  if (!fromDateKey(startKey) || !fromDateKey(endKey)) {
    return { error: "Please select your check-in and check-out dates." };
  }

  // Der Server läuft in UTC. Einen Tag Spielraum, damit "heute" auch für
  // Gäste in Zeitzonen westlich von UTC (z. B. USA am Abend) noch buchbar ist.
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (startKey < toDateKey(yesterday)) {
    return { error: "Check-in can't be in the past." };
  }

  const nights = countNights(startKey, endKey);
  if (nights < 1 || nights > MAX_NIGHTS) {
    return { error: `Stays can be between 1 and ${MAX_NIGHTS} nights.` };
  }

  const home = await prisma.home.findUnique({
    where: { id: homeId },
    select: { userId: true, price: true, guests: true, addedLocation: true },
  });

  if (!home || !home.addedLocation || !home.price) {
    return { error: "This home can't be booked." };
  }

  if (home.userId === userId) {
    return { error: "You can't book your own home." };
  }

  const guests = readInt(formData, "guests", 1, home.guests ?? 1);
  if (!guests) {
    return { error: `This home allows up to ${home.guests ?? 1} guests.` };
  }

  const startDate = dateKeyToDb(startKey);
  const endDate = dateKeyToDb(endKey);

  let reservationId: string;
  try {
    // Prüfen und Speichern in EINER Transaktion mit "Serializable": Klicken zwei
    // Gäste gleichzeitig auf "Reserve", kann nur einer gewinnen. Der andere
    // bekommt einen Konflikt (P2034) statt einer Doppelbuchung.
    reservationId = await prisma.$transaction(
      async (tx) => {
        // Überschneidung: bestehende Buchung beginnt vor unserem Check-out
        // und endet nach unserem Check-in
        const overlap = await tx.reservation.findFirst({
          where: {
            homeId,
            startDate: { lt: endDate },
            endDate: { gt: startDate },
          },
          select: { id: true },
        });

        if (overlap) {
          throw new Error("DATES_TAKEN");
        }

        const reservation = await tx.reservation.create({
          data: {
            homeId,
            userId,
            startDate,
            endDate,
            guests,
            totalPrice: nights * (home.price ?? 0),
          },
        });

        return reservation.id;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (error) {
    const isConflict =
      (error instanceof Error && error.message === "DATES_TAKEN") ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034");

    if (isConflict) {
      return { error: "Sorry, these dates were just booked. Please pick other dates." };
    }
    throw error;
  }

  revalidatePath(`/home/${homeId}`);
  revalidatePath("/reservations");
  return redirect(`/reservations?booked=${reservationId}`);
}

export async function cancelReservation(formData: FormData) {
  const userId = await requireUserId("/reservations");
  const reservationId = String(formData.get("reservationId") ?? "");

  // Nur eigene Buchungen, die noch nicht begonnen haben
  await prisma.reservation.deleteMany({
    where: {
      id: reservationId,
      userId,
      startDate: { gt: dateKeyToDb(toDateKey(new Date())) },
    },
  });

  revalidatePath("/reservations");
}

// ─── Bewertungen ────────────────────────────────────────────────────────────

export async function createReview(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = await requireUserId("/reservations");
  const reservationId = String(formData.get("reservationId") ?? "");
  const rating = readInt(formData, "rating", 1, 5);
  const comment = readText(formData, "comment", 1000);

  if (!rating) {
    return { error: "Please choose between 1 and 5 stars." };
  }
  if (!comment || comment.length < 10) {
    return { error: "Please write at least one short sentence." };
  }

  // Nur eigene Buchungen, und erst nach dem Check-out
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId },
    select: { homeId: true, endDate: true, Review: { select: { id: true } } },
  });

  if (!reservation?.homeId) {
    return { error: "Reservation not found." };
  }
  if (dbToDateKey(reservation.endDate) > toDateKey(new Date())) {
    return { error: "You can review your stay after checkout." };
  }
  if (reservation.Review) {
    return { error: "You already reviewed this stay." };
  }

  try {
    await prisma.review.create({
      data: { rating, comment, userId, homeId: reservation.homeId, reservationId },
    });
  } catch (error) {
    // Doppelklick: reservationId ist eindeutig (@unique), der zweite Versuch scheitert
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "You already reviewed this stay." };
    }
    throw error;
  }

  revalidatePath("/reservations");
  revalidatePath(`/home/${reservation.homeId}`);
  revalidatePath("/");
  return { ok: true };
}
