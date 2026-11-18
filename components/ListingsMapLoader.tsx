"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "./ui/skeleton"
import type { MapListing } from "./ListingsMap"

// Wie bei HomeMap: Leaflet braucht `window`, darum nur im Browser laden.
const LazyListingsMap = dynamic(() => import("@/components/ListingsMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[70vh] min-h-[420px] w-full rounded-xl" />,
})

const ListingsMapLoader = ({ listings }: { listings: MapListing[] }) => {
  return <LazyListingsMap listings={listings} />
}

export default ListingsMapLoader
