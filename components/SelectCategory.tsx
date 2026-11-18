"use client";

import { categoryItems } from "@/constants/categoryItems";
import { cn } from "@/lib/utils";
import { Card, CardHeader } from "./ui/card";
import Image from "next/image";
import { useState } from "react";

interface Props {
  defaultValue?: string;
  className?: string;
}

const SelectCategory = ({ defaultValue, className }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(defaultValue)

  return (
    <div className={cn("grid grid-cols-4 max-lg:grid-cols-2 gap-8 mt-10 w-3/5 mx-auto mb-36", className)}>
      <input type="hidden" name="categoryName" value={selectedCategory ?? ""}/>
      {categoryItems.map((item) => (
        // Echter Button statt klickbarem div: auch mit Tastatur (Tab + Enter) wählbar
        <button
          key={item.id}
          type="button"
          aria-pressed={selectedCategory === item.name}
          onClick={() => setSelectedCategory(item.name)}
          className="text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card
            className={cn(
              "h-full transition-colors hover:border-foreground/40",
              selectedCategory === item.name && "border-2 border-foreground"
            )}
          >
            <CardHeader>
              <Image
                src={item.imageUrl}
                alt=""
                height={32}
                width={32}
                className="size-8"
              />
              <h3 className="font-medium">{item.title}</h3>
            </CardHeader>
          </Card>
        </button>
      ))}
    </div>
  );
};

export default SelectCategory;
