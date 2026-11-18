import ListingCard from "@/components/ListingCard";
import NoItems from "@/components/NoItems";
import prisma from "@/db/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Favorites | Airbnb-Klon",
};

async function getData(userId: string) {
  const data = await prisma.favorite.findMany({
    where: {
      userId: userId,
    },
    // Die ID des eigenen Favoriten-Eintrags. Vorher wurde `Home.Favorite[0]`
    // genommen: Das kann der Favorit eines ANDEREN Users sein.
    select: {
      id: true,
      Home: {
        select: {
          photo: true,
          id: true,
          title: true,
          price: true,
          country: true,
          description: true,
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


  return (
    <section className="container mx-auto px-5 lg:px-10 mt-10 mb-20">
        <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl">Your Favorites</h2>
        {data.length === 0 ? (
            <NoItems title="Sorry, you don't have any favorites" description="Tap the heart on a listing to save it here"/>
        ): (
            <div className="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 grid-cols-1 gap-8 mt-8">
                {data.map((item) => (
                    <ListingCard
                        key={item.Home?.id}
                        title={item.Home?.title}
                        description={item.Home?.description as string}
                        location={item.Home?.country as string}
                        pathName="/favorites"
                        homeId={item.Home?.id as string}
                        imagePath={item.Home?.photo as string}
                        price={item.Home?.price as number}
                        userId={user.id}
                        favoriteId={item.id}
                        isInFavoriteList={true}
                    />
                ))}
            </div>
        )}
    </section>
  )
};

export default page;
