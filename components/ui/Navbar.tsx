import Image from "next/image";
import Link from "next/link";
import React from "react";
import UserNav from "../UserNav";

const Navbar = () => {
  return (
    <nav className="w.full border-b">
      <div className="flex items-center justify-between container mx-auto p-5 lg:px-10">
        <Link href="/">
          <Image
            src="/airbnb-desktop.png"
            alt="airbnb logo"
            width={150}
            height={150}
            className="hidden lg:block"
          />
          
          <Image
            src="/airbnb-mobile.webp"
            alt="airbnb logo"
            width={45}
            height={45}
            className="block lg:hidden"
          />
        </Link>

        <div className="rounded-full border px-5 py-2">
            Hello from search
        </div>

        <UserNav />
      </div>
    </nav>
  );
};

export default Navbar;
