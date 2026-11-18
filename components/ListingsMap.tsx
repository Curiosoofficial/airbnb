"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { divIcon, latLngBounds, type LatLngTuple } from "leaflet";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { getCountryByValue } from "@/lib/getCountries";
import { formatPrice } from "@/lib/format";

export interface MapListing {
  id: string;
  title: string;
  price: number;
  country: string;
  imageUrl: string;
}

// Inserate kennen nur ihr Land, keine genaue Adresse. Mehrere Inserate im
// selben Land würden genau aufeinander liegen. Darum werden sie spiralförmig
// leicht versetzt (goldener Winkel), damit jedes Preis-Schild klickbar bleibt.
function spreadPositions(listings: MapListing[]) {
  const seen = new Map<string, number>();

  return listings.flatMap((listing) => {
    const center = getCountryByValue(listing.country)?.latLang;
    if (!center || center.length < 2) return [];

    const index = seen.get(listing.country) ?? 0;
    seen.set(listing.country, index + 1);

    const angle = index * 2.39996; // goldener Winkel in Radiant
    const radius = index === 0 ? 0 : 0.9 * Math.sqrt(index);
    const position: LatLngTuple = [
      center[0] + radius * Math.sin(angle),
      center[1] + radius * Math.cos(angle),
    ];

    return [{ listing, position }];
  });
}

const ListingsMap = ({ listings }: { listings: MapListing[] }) => {
  const markers = useMemo(() => spreadPositions(listings), [listings]);

  // Karte so zoomen, dass alle Inserate sichtbar sind
  const bounds = useMemo(
    () =>
      markers.length > 0
        ? latLngBounds(markers.map((marker) => marker.position)).pad(0.3)
        : undefined,
    [markers]
  );

  return (
    <MapContainer
      key={markers.map((marker) => marker.listing.id).join(",")}
      bounds={bounds}
      center={bounds ? undefined : [30, 10]}
      zoom={bounds ? undefined : 2}
      maxZoom={10}
      scrollWheelZoom
      className="h-[70vh] min-h-[420px] rounded-xl relative z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map(({ listing, position }) => (
        <Marker
          key={listing.id}
          position={position}
          title={listing.title}
          icon={divIcon({
            className: "price-marker",
            html: `<span>${formatPrice(listing.price)}</span>`,
            iconSize: [0, 0],
          })}
        >
          <Popup minWidth={220} maxWidth={240}>
            <Link href={`/home/${listing.id}`} className="block !text-foreground no-underline">
              <div className="relative h-32 w-full mb-2">
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  sizes="240px"
                  className="rounded-md object-cover"
                />
              </div>
              <span className="block font-semibold text-sm">{listing.title}</span>
              <span className="block text-sm">
                <strong>{formatPrice(listing.price)}</strong> night
              </span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ListingsMap;
