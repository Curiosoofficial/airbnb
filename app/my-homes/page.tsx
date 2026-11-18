import HomeActions from "@/components/HomeActions";
import ListingCard from "@/components/ListingCard";
import NoItems from "@/components/NoItems";
import prisma from "@/db/db";
import { getRatings } from "@/lib/reviews";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Listings | Airbnb-Klon",
};

async function getData(userId: string) {
  const data = await prisma.home.findMany({
    where: {
      userId: userId,
      addedCategory: true,
      addedDescription: true,
      addedLocation: true,
    },
    select: {
      id: true,
      title: true,
      country: true,
      city: true,
      photo: true,
      description: true,
      price: true,
      Favorite: {
        where: {
          userId: userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

const page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    redirect("/");
  }
  const data = await getData(user.id);
  const ratings = await getRatings(data.map((item) => item.id));
  return (
    <section className="container mx-auto px-5 lg:px-10 mt-10 mb-20">
      <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl">
        Your Homes
      </h2>

      {data.length === 0 ? (
            <NoItems title="You don't have any homes listed" description="Please add a home to see it here"/>
        ): (
            <div className="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 grid-cols-1 gap-8 mt-8">
                {data.map((item) => (
                  <div key={item.id}>
                    <ListingCard
                        title={item.title}
                        description={item.description as string}
                        location={item.country as string}
                        city={item.city}
                        rating={ratings.get(item.id) ?? null}
                        pathName="/my-homes"
                        homeId={item.id}
                        imagePath={item.photo as string}
                        price={item?.price as number}
                        userId={user.id}
                        favoriteId={item.Favorite[0]?.id as string}
                        isInFavoriteList={item.Favorite.length > 0}
                    />
                    <HomeActions homeId={item.id}/>
                  </div>
                ))}
            </div>
        )}
    </section>
  );
};

export default page;
