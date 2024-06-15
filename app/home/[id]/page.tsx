import CategoryShowcase from "@/components/CategoryShowcase";
import HomeMap from "@/components/HomeMap";
import { Separator } from "@/components/ui/separator";
import prisma from "@/db/db";
import { useCountries } from "@/lib/getCountries";
import Image from "next/image";

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
  const {getCountryByValue} = useCountries();
  const country = getCountryByValue(data?.country as string);
  return (
    <div className="w-[75%] mx-auto my-10">
      <h1 className="font-medium text-2xl mb-5">{data?.title}</h1>
      <div className="relative h-[550px] max-lg:h-[320px]">
        <Image
          alt="Image of the home"
          src={`https://atbbixtemoxbbezyxiop.supabase.co/storage/v1/object/public/images/${data?.photo}`}
          fill
          className="rounded-lg h-full object-cover w-full"
        />
      </div>
      <div className="flex justify-between gap-x-24 mt-8">
        <div className="w-2/3">
            <h3 className="text-xl font-medium">{country?.flag} {country?.label}</h3>
            <div className="flex gap-x-2 text-muted-foreground">
                <p>{data?.guests} Guests</p> &middot; <p>{data?.bedrooms} Bedrooms</p> &middot; <p>{data?.bathrooms} Bathrooms</p>
            </div>
            <div className="flex items-center mt-6">
                
                <Image 
                    //@ts-ignore
                    src={data?.User.ProfileImage ?? "/user.png"}
                    alt="Profile image"
                    width={44}
                    height={44}
                    className="rounded-full"
                />
                <div className="flex flex-col ml-4">
                    <h3 className="font-medium">Hosted by {data?.User?.firstName}</h3>
                    <p className="text-sm text-muted-foreground">Host since 2015</p>
                </div>
            </div>
            <Separator className="my-5"/>

            <CategoryShowcase categoryName={data?.categoryName as string} />

            <Separator className="my-5"/>

            <p className="text-muted-foreground">{data?.description}</p>

            <Separator className="my-5"/>

            <HomeMap locationValue={data?.country as string} />
        </div>
      </div>
    </div>
  );
};

export default Page;
