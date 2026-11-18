import CategoryShowcase from "@/components/CategoryShowcase";
import HomeMap from "@/components/HomeMap";
import { Separator } from "@/components/ui/separator";
import prisma from "@/db/db";
import { useCountries } from "@/lib/getCountries";
import { getImageUrl } from "@/lib/imageUrl";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getData(homeId: string) {
  const data = await prisma.home.findUnique({
    where: {
      id: homeId,
    },
    select: {
      photo: true,
      description: true,
      guests: true,
      bedrooms: true,
      bathrooms: true,
      title: true,
      categoryName: true,
      price: true,
      country: true,
      User: {
        select: {
            ProfileImage: true,
            firstName: true,
        }
      }
    },
  });

  return data;
}

const Page = async ({ params }: { params: { id: string } }) => {
  const data = await getData(params.id);

  // Unbekannte ID: saubere 404-Seite statt einer halb leeren Seite
  if (!data) {
    notFound();
  }

  const {getCountryByValue} = useCountries();
  const country = getCountryByValue(data.country as string);
  return (
    <div className="w-[75%] mx-auto my-10">
      <h1 className="font-medium text-2xl mb-5">{data.title}</h1>
      <div className="relative h-[550px] max-lg:h-[320px]">
        <Image
          alt="Image of the home"
          src={getImageUrl(data.photo)}
          fill
          sizes="75vw"
          className="rounded-lg h-full object-cover w-full"
        />
      </div>
      <div className="flex justify-between gap-x-24 mt-8">
        <div className="w-2/3">
            <h3 className="text-xl font-medium">{country?.flag} {country?.label}</h3>
            <div className="flex gap-x-2 text-muted-foreground">
                <p>{data.guests} Guests</p> &middot; <p>{data.bedrooms} Bedrooms</p> &middot; <p>{data.bathrooms} Bathrooms</p>
            </div>
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
                    <p className="text-sm text-muted-foreground">Host since 2015</p>
                </div>
            </div>
            <Separator className="my-5"/>

            <CategoryShowcase categoryName={data.categoryName as string} />

            <Separator className="my-5"/>

            <p className="text-muted-foreground">{data.description}</p>

            <Separator className="my-5"/>

            <HomeMap locationValue={data.country as string} />
        </div>
      </div>
    </div>
  );
};

export default Page;
