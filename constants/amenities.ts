import {
  Bath,
  Car,
  CookingPot,
  Dumbbell,
  Flame,
  Laptop,
  Mountain,
  PawPrint,
  Snowflake,
  Thermometer,
  Tv,
  Umbrella,
  WashingMachine,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Ausstattung eines Inserats. In der Datenbank stehen nur die IDs
// (Home.amenities = ["wifi", "pool", ...]), Text und Icon kommen von hier.
export interface Amenity {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const amenities: Amenity[] = [
  { id: "wifi", label: "Wifi", icon: Wifi },
  { id: "kitchen", label: "Kitchen", icon: CookingPot },
  { id: "washer", label: "Washer", icon: WashingMachine },
  { id: "parking", label: "Free parking", icon: Car },
  { id: "pool", label: "Pool", icon: Waves },
  { id: "hot_tub", label: "Hot tub", icon: Bath },
  { id: "air_conditioning", label: "Air conditioning", icon: Snowflake },
  { id: "heating", label: "Heating", icon: Thermometer },
  { id: "workspace", label: "Dedicated workspace", icon: Laptop },
  { id: "tv", label: "TV", icon: Tv },
  { id: "fireplace", label: "Fireplace", icon: Flame },
  { id: "beach_access", label: "Beach access", icon: Umbrella },
  { id: "mountain_view", label: "Mountain view", icon: Mountain },
  { id: "pets", label: "Pets allowed", icon: PawPrint },
  { id: "ev_charger", label: "EV charger", icon: Zap },
  { id: "gym", label: "Gym", icon: Dumbbell },
];

const amenityIds = new Set(amenities.map((amenity) => amenity.id));

// Nur bekannte IDs behalten (Formulardaten und URL-Parameter sind Benutzereingaben)
export function cleanAmenities(values: string[]) {
  return [...new Set(values)].filter((value) => amenityIds.has(value));
}
