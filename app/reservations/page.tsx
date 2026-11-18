import NoItems from "@/components/NoItems";
import TripCard from "@/components/TripCard";
import prisma from "@/db/db";
import { dbToDateKey, formatDateRange, toDateKey } from "@/lib/dates";
import { formatPrice, plural } from "@/lib/format";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Trips | Airbnb-Klon",
};

async function getData(userId: string) {
  const [trips, hostBookings] = await Promise.all([
    // Eigene Reisen
    prisma.reservation.findMany({
      where: { userId },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        guests: true,
        totalPrice: true,
        Home: {
          select: {
            id: true,
            title: true,
            photo: true,
            country: true,
            User: { select: { firstName: true } },
          },
        },
      },
    }),
    // Buchungen anderer Gäste auf meinen Inseraten (Gastgeber-Sicht)
    prisma.reservation.findMany({
      where: { Home: { userId } },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        guests: true,
        totalPrice: true,
        Home: { select: { id: true, title: true } },
        User: { select: { firstName: true, ProfileImage: true } },
      },
    }),
  ]);

  return { trips, hostBookings };
}

const page = async ({ searchParams }: { searchParams: Promise<{ booked?: string }> }) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    redirect(`/api/auth/login?post_login_redirect_url=${encodeURIComponent("/api/auth/creation?next=/reservations")}`);
  }

  const { booked } = await searchParams;
  const { trips, hostBookings } = await getData(user.id);
  const todayKey = toDateKey(new Date());

  // Reise gilt als vergangen, sobald der Check-out-Tag erreicht ist
  const upcoming = trips.filter((trip) => dbToDateKey(trip.endDate) > todayKey);
  const past = trips.filter((trip) => dbToDateKey(trip.endDate) <= todayKey);
  const justBooked = trips.find((trip) => trip.id === booked);

  const renderTrip = (trip: (typeof trips)[number], canCancel: boolean) => (
    <TripCard
      key={trip.id}
      reservationId={trip.id}
      homeId={trip.Home?.id ?? ""}
      title={trip.Home?.title ?? "Deleted listing"}
      photo={trip.Home?.photo ?? null}
      country={trip.Home?.country ?? ""}
      hostName={trip.Home?.User?.firstName ?? "-"}
      startKey={dbToDateKey(trip.startDate)}
      endKey={dbToDateKey(trip.endDate)}
      guests={trip.guests}
      totalPrice={trip.totalPrice}
      canCancel={canCancel && dbToDateKey(trip.startDate) > todayKey}
      highlight={trip.id === booked}
    />
  );

  return (
    <section className="container mx-auto px-5 lg:px-10 mt-10 mb-20 flex flex-col gap-y-12">
      {justBooked && (
        <div role="status" className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-900 border border-green-200">
          <CheckCircle2 className="size-6 shrink-0"/>
          <p>
            <span className="font-medium">You&apos;re going to {justBooked.Home?.title}!</span>{" "}
            {formatDateRange(dbToDateKey(justBooked.startDate), dbToDateKey(justBooked.endDate))}
          </p>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl">Upcoming trips</h2>
        {upcoming.length === 0 ? (
          <NoItems title="No trips booked... yet!" description="Time to dust off your bags and start planning your next adventure."/>
        ) : (
          <div className="grid xl:grid-cols-2 gap-6 mt-8">
            {upcoming.map((trip) => renderTrip(trip, true))}
          </div>
        )}
        {upcoming.length === 0 && (
          <div className="mt-6 text-center">
            <Link href="/" className="font-medium underline">Start searching</Link>
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight max-lg:text-xl">Where you&apos;ve been</h2>
          <div className="grid xl:grid-cols-2 gap-6 mt-8">
            {past.map((trip) => renderTrip(trip, false))}
          </div>
        </div>
      )}

      {hostBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight max-lg:text-xl">Reservations for your homes</h2>
          <ul className="mt-6 divide-y rounded-xl border">
            {hostBookings.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center gap-4 p-4">
                <Image
                  src={booking.User?.ProfileImage || "/profileImage.jpg"}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="size-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium">
                    {booking.User?.firstName || "A guest"} &middot;{" "}
                    <Link href={`/home/${booking.Home?.id}`} className="hover:underline">{booking.Home?.title}</Link>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateRange(dbToDateKey(booking.startDate), dbToDateKey(booking.endDate))} &middot; {plural(booking.guests, "guest")}
                  </p>
                </div>
                <p className="font-medium">{formatPrice(booking.totalPrice)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default page;
