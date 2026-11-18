// Erzeugt constants/countries.json: nur die Felder, die die App im Browser braucht.
// Ausführen mit: node scripts/build-countries.mjs
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const countries = createRequire(import.meta.url)("world-countries");

const compact = countries
  .map((item) => ({
    value: item.cca2,
    label: item.name.common,
    flag: item.flag,
    latLang: item.latlng,
    region: item.region,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "en"));

writeFileSync("constants/countries.json", JSON.stringify(compact));
console.log(`${compact.length} Länder geschrieben`);
