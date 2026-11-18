import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { createAirbnbHome } from "@/lib/actions/actions";
import UserNav from "../UserNav";
import SearchBar from "../SearchBar";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    // sticky: Navigation und Suche bleiben beim Scrollen sichtbar
    <nav className="w-full border-b sticky top-0 z-40 bg-background">
      <div className="flex items-center justify-between gap-x-4 container mx-auto p-5 lg:px-10">
        <Link href="/" className="shrink-0" aria-label="Airbnb-Klon home">
          <Image
            src="/airbnb-desktop.png"
            alt="airbnb logo"
            width={150}
            height={150}
            priority
            className="hidden lg:block"
          />

          <Image
            src="/airbnb-mobile.webp"
            alt="airbnb logo"
            width={45}
            height={45}
            priority
            className="block lg:hidden"
          />
        </Link>

        {/* Hier stand im Tutorial nur ein Platzhalter "Hello from search".
            SearchBar liest die URL (useSearchParams), darum Suspense. */}
        <div className="flex-1 flex justify-center min-w-0">
          <Suspense fallback={<div className="h-12 w-full max-w-md rounded-full border"/>}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex items-center gap-x-2 shrink-0">
          {user ? (
            <form action={createAirbnbHome} className="hidden xl:block">
              <button type="submit" className="rounded-full px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
                Airbnb your home
              </button>
            </form>
          ) : (
            <LoginLink className="hidden xl:block rounded-full px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
              Airbnb your home
            </LoginLink>
          )}
          <UserNav />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
