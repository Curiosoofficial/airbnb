import ListingCard from "@/components/ListingCard";
import NoItems from "@/components/NoItems";
import prisma from "@/db/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

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
      country: true,
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
  return (
    <section className="container mx-auto px-5 lg:px-10 mt-10">
      <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl">
        Your Homes
      </h2>

      {data.length === 0 ? (
            <NoItems title="You dont have any Homes listed" description="Please add a Home to see them here"/>
        ): (
            <div className="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 grid-cols-1 gap-8 mt-8">
                {data.map((item) => (
                    <ListingCard 
                        key={item.id}
                        description={item.description as string}
                        location={item.country as string}
                        pathName="/my-homes"
                        homeId={item.id}
                        imagePath={item.photo as string}
                        price={item?.price as number}
                        userId={user.id}
                        favoriteId={item.Favorite[0]?.id as string}
                        isInFavoriteList={item.Favorite.length as number > 0 ? true : false}
                    />
                ))}
            </div>
        )}
    </section>
  );
};

export default page;
