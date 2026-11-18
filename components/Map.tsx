"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useCountries } from "@/lib/getCountries";
import { icon, type LatLngTuple } from "leaflet";
import { useEffect } from "react";

const ICON = icon({
  iconUrl: "/marker.png",
  iconSize: [50, 50],
});

const FALLBACK_CENTER: LatLngTuple = [52.505, -0.09];

// `center` von MapContainer wird nur beim ersten Rendern gelesen.
// Damit die Karte mitspringt, wenn man ein anderes Land wählt,
// setzen wir die Ansicht hier selbst neu.
function Recenter({ center }: { center: LatLngTuple }) {
  const map = useMap();
  const [lat, lng] = center;

  useEffect(() => {
    map.setView([lat, lng]);
  }, [map, lat, lng]);

  return null;
}

const Map = ({ locationValue }: { locationValue: string }) => {
  const { getCountryByValue } = useCountries();
  const latLang = (getCountryByValue(locationValue)?.latLang ??
    FALLBACK_CENTER) as LatLngTuple;

  return (
    <MapContainer
      scrollWheelZoom={false}
      className="h-[50vh] rounded-lg relative z-0"
      center={latLang}
      zoom={6}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={latLang} icon={ICON} />
      <Recenter center={latLang} />
    </MapContainer>
  );
};

export default Map;
