import ListingCard from "@/components/ListingCard";
import Stars from "@/components/Stars";
import { Separator } from "@/components/ui/separator";
import prisma from "@/db/db";
import { formatRating, plural } from "@/lib/format";
import { getRatings } from "@/lib/reviews";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { format } from "date-fns";
import { Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

const PUBLISHED = { addedCategory: true, addedDescription: true, addedLocation: true };

// Öffentliches Profil: nur Vorname, Bild und "Host since". Keine E-Mail, kein Nachname.
const getHost = cache(async (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: { id: true, firstName: true, ProfileImage: true, createdAt: true },
  })
);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const host = await getHost(id);
  return { title: host ? `${host.firstName} · Host | Airbnb-Klon` : "Airbnb-Klon" };
}

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const host = await getHost(id);
  if (!host) notFound();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const [homes, reviews, ratingStats] = await Promise.all([
    prisma.home.findMany({
      where: { ...PUBLISHED, userId: host.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        photo: true,
        price: true,
        country: true,
        city: true,
        Favorite: { where: { userId: user?.id ?? "-" }, select: { id: true } },
      },
    }),
    prisma.review.findMany({
      where: { Home: { userId: host.id } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        User: { select: { firstName: true, ProfileImage: true } },
        Home: { select: { id: true, title: true } },
      },
    }),
    prisma.review.aggregate({
      where: { Home: { userId: host.id } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const ratings = await getRatings(homes.map((home) => home.id));
  const reviewCount = ratingStats._count._all;

  return (
    <div className="container mx-auto px-5 lg:px-10 my-10 grid gap-10 lg:grid-cols-[320px_1fr]">
      {/* Profilkarte links, wie bei Airbnb */}
      <aside className="h-fit rounded-2xl p-8 shadow-[0_6px_16px_rgba(0,0,0,0.12)] lg:sticky lg:top-28">
        <div className="flex items-center gap-x-6">
          <div className="flex flex-col items-center">
            <Image
              src={host.ProfileImage || "/profileImage.jpg"}
              alt=""
              width={96}
              height={96}
              unoptimized
              className="size-24 rounded-full object-cover"
            />
            <h1 className="mt-3 text-2xl font-semibold">{host.firstName}</h1>
            <p className="text-sm text-muted-foreground">Host</p>
          </div>
          <dl className="flex flex-col divide-y text-sm">
            <div className="pb-2">
              <dt className="sr-only">Reviews</dt>
              <dd className="text-xl font-semibold">{reviewCount}</dd>
              <span className="text-xs">{reviewCount === 1 ? "Review" : "Reviews"}</span>
            </div>
            <div className="py-2">
              <dt className="sr-only">Rating</dt>
              <dd className="flex items-center gap-x-1 text-xl font-semibold">
                {reviewCount > 0 ? formatRating(ratingStats._avg.rating ?? 0) : "–"} <Star className="size-3.5 fill-foreground"/>
              </dd>
              <span className="text-xs">Rating</span>
            </div>
            <div className="pt-2">
              <dt className="sr-only">Years hosting</dt>
              <dd className="text-xl font-semibold">{Math.max(new Date().getFullYear() - host.createdAt.getFullYear(), 0)}</dd>
              <span className="text-xs">Years hosting</span>
            </div>
          </dl>
        </div>
      </aside>

      <div>
        <h2 className="text-2xl font-semibold">{host.firstName}&apos;s listings</h2>
        {homes.length === 0 ? (
          <p className="mt-4 text-muted-foreground">{host.firstName} hasn&apos;t listed a home yet.</p>
        ) : (
          <div className="mt-6 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {homes.map((home) => (
              <ListingCard
                key={home.id}
                title={home.title}
                description={home.description as string}
                imagePath={home.photo as string}
                location={home.country as string}
                city={home.city}
                rating={ratings.get(home.id) ?? null}
                price={home.price as number}
                userId={user?.id}
                favoriteId={home.Favorite[0]?.id}
                isInFavoriteList={home.Favorite.length > 0}
                homeId={home.id}
                pathName={`/users/${host.id}`}
              />
            ))}
          </div>
        )}

        <Separator className="my-10"/>

        <h2 className="text-2xl font-semibold">
          {reviewCount > 0 ? `${plural(reviewCount, "review")} for ${host.firstName}` : `No reviews for ${host.firstName} yet`}
        </h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border p-5">
              <p className="line-clamp-4 text-muted-foreground">&ldquo;{review.comment}&rdquo;</p>
              <div className="mt-4 flex items-center gap-x-3">
                <Image src={review.User?.ProfileImage || "/profileImage.jpg"} alt="" width={36} height={36} unoptimized className="size-9 rounded-full object-cover"/>
                <div className="text-sm">
                  <p className="font-medium">{review.User?.firstName || "Former guest"}</p>
                  <p className="flex items-center gap-x-2 text-muted-foreground">
                    <Stars rating={review.rating}/> · {format(review.createdAt, "MMM yyyy")}
                  </p>
                </div>
              </div>
              {review.Home && (
                <Link href={`/home/${review.Home.id}`} className="mt-3 block text-sm underline">{review.Home.title}</Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default page;
