import { useCountries } from "@/lib/getCountries";
import Image from "next/image";
import Link from "next/link";

interface IAppProps {
  imagePath: string;
  description: string;
  location: string;
  price: number;
}

const ListingCard = ({
  imagePath,
  description,
  location,
  price,
}: IAppProps) => {
    const {getCountryByValue} = useCountries();
    const country = getCountryByValue(location);

  return (
    <div className="flex flex-col">
      <div className="relative h-72">
        <Image
          src={`https://atbbixtemoxbbezyxiop.supabase.co/storage/v1/object/public/images/${imagePath}`}
          alt="Listing Image"
          fill
          className="rounded-lg h-full object-cover mb-3"
        />
      </div>


      <Link href={"/"}>
        <h3 className="font-medium text-base">{country?.flag} {country?.label}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
        <p className="pt-2 text-muted-foreground"><span className="font-medium text-black">${price}</span> / Night</p>
      </Link>
    </div>
  );
};

export default ListingCard;



