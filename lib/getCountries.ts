import countries from "@/constants/countries.json"

// Kompakte Länderliste (Code, Name, Flagge, Mittelpunkt), alphabetisch sortiert.
// Vorher wurde hier das ganze Paket "world-countries" importiert (512 KB mit
// Grenzen, Währungen, Übersetzungen ...). Weil Länderauswahl und Karten im
// Browser laufen, landete alles im JavaScript-Bundle. Jetzt sind es 24 KB.
// Neu erzeugen: siehe scripts/build-countries.mjs
type Country = {
    value: string
    label: string
    flag: string
    latLang: number[]
    region: string
}

const countriesFormatted = countries as Country[]

export const getAllCountries = () => countriesFormatted

export const getCountryByValue = (value: string) => {
    return countriesFormatted.find((item) => item.value === value)
}

// Trotz "use" im Namen kein echter React-Hook (kein State, kein Effect).
// Für Server-Komponenten, besonders async ones, die Funktionen oben direkt
// importieren: Hooks sind dort verboten, und ESLint meldet das sonst.
export const useCountries = () => ({
    getAllCountries,
    getCountryByValue,
})
