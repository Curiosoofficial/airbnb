import countries from "world-countries"

const countriesFormatted = countries.map((item) => ({
    value: item.cca2,
    label: item.name.common,
    flag: item.flag,
    latLang: item.latlng,
    region: item.region,
}))

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
