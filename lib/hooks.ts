"use client";

import { useSyncExternalStore } from "react";

// Werte aus dem Browser (Bildschirmbreite, iframe) sauber in React lesen.
// useSyncExternalStore statt useEffect + useState: kein doppeltes Rendern,
// und auf dem Server gibt es einen festen Startwert (dritter Parameter).

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

// true, wenn die Seite in einem iframe läuft (z. B. als Demo im Portfolio)
export function useIsFramed() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return window.self !== window.top;
      } catch {
        // Zugriff auf window.top verboten = sicher in einem fremden iframe
        return true;
      }
    },
    () => false
  );
}
