import ListingCard from "@/components/ListingCard";
import MapFilterItems from "@/components/MapFilterItems";
import NoItems from "@/components/NoItems";
import SkeletonHome from "@/components/SkeletonHome";
import prisma from "@/db/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Suspense } from "react";

async function getData({
  filter,
  userId,
}: {
  userId: string | undefined;
  filter?: string;
}) {
  const data = await prisma.home.findMany({
    where: {
      addedCategory: true,
      addedDescription: true,
      addedLocation: true,
      categoryName: filter ?? undefined,
    },
    select: {
      photo: true,
      id: true,
      price: true,
      description: true,
      country: true,
      Favorite: {
        where: {
          userId: userId ?? undefined,
        },
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

// Seit Next 15/16 ist `searchParams` ein Promise.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  return (
    <div className="container mx-auto px-5 lg:px-10">
      {/* MapFilterItems liest die URL mit useSearchParams() und braucht darum
          eine eigene Suspense-Grenze */}
      <Suspense fallback={<div className="h-[68px]" />}>
        <MapFilterItems />
      </Suspense>
      <Suspense fallback={<SkeletonHome />} key={filter}>
        <ShowItems filter={filter} />
      </Suspense>
    </div>
  );
}

async function ShowItems({ filter }: { filter?: string }) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData({ filter, userId: user?.id });

  return (
    <>
      {data.length === 0 ? (
          <NoItems title="Sorry, there is no listing for this category" description="Please check a other category or create your own"/>
      ): (
        <div className="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
        {data.map((item) => (
          <ListingCard
            key={item.id}
            description={item.description as string}
            imagePath={item.photo as string}
            location={item.country as string}
            price={item.price as number}
            userId={user?.id}
            favoriteId={item.Favorite[0]?.id}
            isInFavoriteList={item.Favorite.length > 0 ? true : false}
            homeId={item.id}
            pathName="/"
          />
        ))}
      </div>
      )}
    </>
  );
}
