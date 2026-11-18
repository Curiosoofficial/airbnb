"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "./ui/skeleton"

// Leaflet greift beim Import auf `window` zu, das gibt es auf dem Server nicht.
// Darum: Karte nur im Browser laden (`ssr: false`).
// Zwei Regeln dabei:
// 1. `ssr: false` geht nur in einer Client-Komponente ("use client").
// 2. `dynamic()` gehört auf Modul-Ebene. Im Komponenten-Körper entsteht bei
//    jedem Render eine neue Komponente, und die Karte wird jedes Mal neu gebaut.
const LazyMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[50vh] w-full" />,
})

const HomeMap = ({ locationValue }: { locationValue: string }) => {
  return <LazyMap locationValue={locationValue} />
}

export default HomeMap
