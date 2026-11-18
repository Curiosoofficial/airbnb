"use client"

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllCountries } from "@/lib/getCountries"
import { useState } from "react"
import HomeMap from "./HomeMap"

interface Props {
  name?: string
  defaultValue?: string
  showMap?: boolean
  placeholder?: string
  onChange?: (value: string) => void
}

// Länderauswahl mit verstecktem Formularfeld. Wird im Inserat-Assistenten,
// beim Bearbeiten und in der Suche verwendet (vorher nur im Assistenten).
const CountrySelect = ({
  name = "countryValue",
  defaultValue = "",
  showMap = false,
  placeholder = "Select a country",
  onChange,
}: Props) => {
  const [value, setValue] = useState(defaultValue)

  return (
    <div className="flex flex-col gap-y-5">
      <input type="hidden" name={name} value={value}/>
      {/* value "" zeigt bei Radix den Platzhalter (nichts gewählt) */}
      <Select
        value={value}
        onValueChange={(newValue) => {
          setValue(newValue)
          onChange?.(newValue)
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}/>
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>Countries</SelectLabel>
            {getAllCountries().map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.flag} {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {showMap && <HomeMap locationValue={value}/>}
    </div>
  )
}

export default CountrySelect
