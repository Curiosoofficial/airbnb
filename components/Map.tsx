"use client";

import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useCountries } from "@/lib/getCountries";
import { icon, type LatLngTuple } from "leaflet";
import { useEffect } from "react";

const ICON = icon({
  iconUrl: "/marker.png",
  iconSize: [50, 50],
});

const FALLBACK_CENTER: LatLngTuple = [52.505, -0.09];

export interface MapProps {
  locationValue: string;
  // Genaue Koordinaten (neuere Inserate). Ohne sie: Mitte des Landes.
  latitude?: number | null;
  longitude?: number | null;
}

// `center` von MapContainer wird nur beim ersten Rendern gelesen.
// Damit die Karte mitspringt, wenn man einen anderen Ort wählt,
// setzen wir die Ansicht hier selbst neu.
function Recenter({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();
  const [lat, lng] = center;

  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [map, lat, lng, zoom]);

  return null;
}

const Map = ({ locationValue, latitude, longitude }: MapProps) => {
  const { getCountryByValue } = useCountries();
  const precise = typeof latitude === "number" && typeof longitude === "number";
  const center = (
    precise
      ? [latitude, longitude]
      : getCountryByValue(locationValue)?.latLang ?? FALLBACK_CENTER
  ) as LatLngTuple;
  const zoom = precise ? 11 : 6;

  return (
    <MapContainer
      scrollWheelZoom={false}
      className="h-[50vh] rounded-lg relative z-0"
      center={center}
      zoom={zoom}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Wie bei Airbnb: Bei genauem Ort nur ein Kreis (ungefähre Lage),
          kein Pin auf der Haustür */}
      {precise ? (
        <Circle center={center} radius={1500} pathOptions={{ color: "#E21C49", fillColor: "#E21C49", fillOpacity: 0.15 }} />
      ) : (
        <Marker position={center} icon={ICON} />
      )}
      <Recenter center={center} zoom={zoom} />
    </MapContainer>
  );
};

export default Map;
