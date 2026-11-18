import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";
import { createAirbnbHome } from "@/lib/actions/actions";

const UserNav = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  // "/user.png" gab es im public-Ordner nie, darum war das Bild für Gäste kaputt
  const userImage = user?.picture || "/profileImage.jpg";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Open user menu" className="rounded-full">
        <div className="rounded-full border p-2 lg:py-2 lg:px-4 flex items-center gap-x-3 hover:shadow-md transition-shadow">
          <MenuIcon className="size-6 lg:size-5" />

          <Image
            alt="User profile"
            src={userImage}
            width={30}
            height={30}
            unoptimized
            className="rounded-full hidden lg:block size-[30px] object-cover"
          />
        </div>
      </DropdownMenuTrigger>
      {/* asChild: Der ganze Menüeintrag ist klickbar, nicht nur der Text darin */}
      <DropdownMenuContent align="end" className="w-[220px]">
        {user ? (
          <>
            <DropdownMenuLabel className="font-normal text-muted-foreground">
              Hi {user.given_name || "there"}!
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/reservations" className="w-full font-medium">My Trips</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/favorites" className="w-full font-medium">My Favorites</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <form action={createAirbnbHome} className="w-full">
                <button type="submit" className="w-full text-start">
                  Airbnb your Home
                </button>
              </form>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/my-homes" className="w-full">My Listings</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LogoutLink className="w-full">Logout</LogoutLink>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <LoginLink className="w-full font-medium">Sign in</LoginLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <RegisterLink className="w-full">Register</RegisterLink>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNav;
