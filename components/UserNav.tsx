import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
      <DropdownMenuTrigger>
        <div className="rounded-full border p-2 lg:py-2 lg:px-4 flex items-center gap-x-3">
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
      <DropdownMenuContent align="end" className="w-[200px]">
        {user ? (
          <>
            <DropdownMenuItem>
              <form action={createAirbnbHome} className="w-full">
                <button type="submit" className="w-full text-start">
                  Airbnb your Home
                </button>
              </form>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Link href="/my-homes">My Listings</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Link href="/favorites">My Favorites</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogoutLink className="w-full">Logout</LogoutLink>
            </DropdownMenuItem>
            
          </>
        ) : (
          <>
            <DropdownMenuItem>
              <RegisterLink className="w-full">Register</RegisterLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LoginLink className="w-full">Sign in</LoginLink>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNav;
