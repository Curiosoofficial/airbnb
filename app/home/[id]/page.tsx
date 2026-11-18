import CategoryShowcase from "@/components/CategoryShowcase";
import HomeMap from "@/components/HomeMap";
import ReservationCard from "@/components/ReservationCard";
import { Separator } from "@/components/ui/separator";
import prisma from "@/db/db";
import { dateKeyToDb, dbToDateKey, toDateKey } from "@/lib/dates";
import { plural } from "@/lib/format";
import { getCountryByValue } from "@/lib/getCountries";
import { getImageUrl } from "@/lib/imageUrl";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";

// `cache`: generateMetadata und die Seite brauchen dieselben Daten.
// So geht trotzdem nur EINE Abfrage an die Datenbank.
const getData = cache(async (homeId: string) => {
  const data = await prisma.home.findUnique({
    where: {
      id: homeId,
    },
    select: {
      id: true,
      photo: true,
      description: true,
      guests: true,
      bedrooms: true,
      bathrooms: true,
      title: true,
      categoryName: true,
      price: true,
      country: true,
      addedLocation: true,
      userId: true,
      User: {
        select: {
            ProfileImage: true,
            firstName: true,
            createdAt: true,
        }
      },
      // Nur Buchungen, die noch nicht vorbei sind: für die gesperrten Tage im Kalender
      Reservation: {
        where: {
          endDate: { gt: dateKeyToDb(toDateKey(new Date())) },
        },
        select: {
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  return data;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getData(id);
  const country = getCountryByValue(data?.country ?? "");

  return {
    title: data?.title ? `${data.title} · ${country?.label ?? ""} | Airbnb-Klon` : "Airbnb-Klon",
    description: data?.description ?? undefined,
  };
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data = await getData(id);

  // Unbekannte ID oder halb fertiges Inserat: saubere 404-Seite
  if (!data || !data.addedLocation) {
    notFound();
  }

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const country = getCountryByValue(data.country as string);
  const hostSince = data.User?.createdAt.getFullYear();

  return (
    <div className="container mx-auto px-5 lg:px-10 my-10">
      <h1 className="font-medium text-2xl mb-5">{data.title}</h1>
      <div className="relative h-[550px] max-lg:h-[320px]">
        <Image
          alt={data.title ?? "Image of the home"}
          src={getImageUrl(data.photo)}
          fill
          priority
          sizes="(min-width: 1400px) 1300px, 100vw"
          className="rounded-xl h-full object-cover w-full"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-x-16 gap-y-10 mt-8">
        <div className="lg:col-span-2">
            <h3 className="text-xl font-medium">{country?.flag} {country?.label}</h3>
            <p className="text-muted-foreground">
              {plural(data.guests ?? 1, "guest")} &middot; {plural(data.bedrooms ?? 1, "bedroom")} &middot; {plural(data.bathrooms ?? 1, "bathroom")}
            </p>

            <div className="flex items-center mt-6">
                {/* Profilbilder kommen von beliebigen Hosts (Google, GitHub, Gravatar ...).
                    `unoptimized` lädt sie direkt, ohne Next-Bildoptimierung und Domain-Liste. */}
                <Image
                    src={data.User?.ProfileImage || "/profileImage.jpg"}
                    alt="Profile image"
                    width={44}
                    height={44}
                    unoptimized
                    className="rounded-full size-11 object-cover"
                />
                <div className="flex flex-col ml-4">
                    <h3 className="font-medium">Hosted by {data.User?.firstName}</h3>
                    {hostSince && <p className="text-sm text-muted-foreground">Host since {hostSince}</p>}
                </div>
            </div>
            <Separator className="my-5"/>

            <CategoryShowcase categoryName={data.categoryName as string} />

            <Separator className="my-5"/>

            <p className="text-muted-foreground whitespace-pre-line">{data.description}</p>

            <Separator className="my-5"/>

            <h3 className="text-xl font-medium mb-4">Where you&apos;ll be</h3>
            <HomeMap locationValue={data.country as string} />
        </div>

        <aside className="lg:sticky lg:top-28 h-fit">
          <ReservationCard
            homeId={data.id}
            price={data.price ?? 0}
            maxGuests={data.guests ?? 1}
            booked={data.Reservation.map((item) => ({
              start: dbToDateKey(item.startDate),
              end: dbToDateKey(item.endDate),
            }))}
            isOwner={!!user && user.id === data.userId}
            isLoggedIn={!!user}
          />
        </aside>
      </div>
    </div>
  );
};

export default Page;
