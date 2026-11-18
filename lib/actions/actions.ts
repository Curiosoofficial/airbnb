"use server";

import prisma from "@/db/db";
import { getSupabase } from "@/db/supabase";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Vercel erlaubt max. 4.5 MB pro Request

// Server Actions sind öffentliche Endpunkte: Jeder kann sie mit beliebigen
// Formulardaten aufrufen. Deshalb kommt die User-ID immer aus der Session,
// nie aus einem (manipulierbaren) Formularfeld.
async function requireUserId() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    redirect("/api/auth/login");
  }

  return user.id;
}

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

  // Ohne gewählte Kategorie zurück zum Schritt (sonst crasht später die Detailseite)
  if (!categoryName) {
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
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price");
  const imageFile = formData.get("image") as File | null;
  const guestNumber = formData.get("guest") as string;
  const roomNumber = formData.get("room") as string;
  const bathroomNumber = formData.get("bathroom") as string;
  const homeId = formData.get("homeId") as string;

  if (!imageFile || imageFile.size === 0) {
    throw new Error("Bitte ein Bild auswählen.");
  }

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

  const { data: imageData, error: uploadError } = await getSupabase()
    .storage.from("images")
    .upload(fileName, imageFile, {
      cacheControl: "2592000",
      contentType: imageFile.type,
    });

  if (uploadError) {
    throw new Error(`Error uploading image: ${uploadError.message}`);
  }

  if (!imageData?.path) {
    throw new Error("Image path is not available after upload.");
  }

  await prisma.home.update({
    where: {
      id: homeId,
      userId: userId,
    },
    data: {
      title: title,
      description: description,
      price: Number(price),
      bedrooms: roomNumber,
      bathrooms: bathroomNumber,
      guests: guestNumber,
      photo: imageData.path,
      addedDescription: true,
    },
  });

  return redirect(`/create/${homeId}/location`);
}

export async function createLocationPage(formData: FormData) {
  const userId = await requireUserId();
  const homeId = formData.get("homeId") as string;
  const countryValue = formData.get("countryValue") as string;

  if (!countryValue) {
    return redirect(`/create/${homeId}/location`);
  }

  await prisma.home.update({
    where: {
      id: homeId,
      userId: userId,
    },
    data: {
      addedLocation: true,
      country: countryValue,
    },
  });

  return redirect("/");
}

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
