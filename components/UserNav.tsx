import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { MenuIcon } from "lucide-react"
import Image from "next/image"
import {RegisterLink, LoginLink} from "@kinde-oss/kinde-auth-nextjs/components";


const UserNav = () => {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger>
            <div className="rounded-full border p-2 lg:py-2 lg:px-4 flex items-center gap-x-3">
                <MenuIcon className="size-6 lg:size-5" />

                <Image
                    alt="User profile"
                    src="/profileImage.jpg"
                    width={30}
                    height={30}
                    className="rounded-full hidden lg:block"
                />
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem><RegisterLink className="w-full">Register</RegisterLink></DropdownMenuItem>
            <DropdownMenuItem><LoginLink className="w-full">Sign in</LoginLink></DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserNav