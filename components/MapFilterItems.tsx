"use client";

import { categoryItems } from "@/constants/categoryItems";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const MapFilterItems = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get("filter");
  const pathname = usePathname();

  // Andere Parameter (Suche, Kartenansicht) bleiben erhalten.
  // Klick auf die aktive Kategorie hebt den Filter wieder auf.
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(name) === value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex gap-x-10 mt-5 w-full overflow-x-scroll no-scrollbar">
      {categoryItems.map((item) => (
        <Link
          key={item.id}
          href={pathname + "?" + createQueryString("filter", item.name)}
          scroll={false}
          aria-current={search === item.name ? "true" : undefined}
          className={cn(
            search === item.name
            ? "border-b-2 border-foreground flex-shrink-0"
            : "opacity-70 border-b-2 border-transparent hover:opacity-100 hover:border-muted-foreground/40 flex-shrink-0",
            "flex flex-col gap-y-3 items-center pb-2 transition-opacity"
          )}
        >
          <div className="relative size-6">
            <Image src={item.imageUrl} alt="" width={24} height={24} />
          </div>
          <p className="text-xs font-medium whitespace-nowrap">{item.title}</p>
        </Link>
      ))}
    </div>
  );
};

export default MapFilterItems;
