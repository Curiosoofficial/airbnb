"use client"
import CreationBottomBar from "@/components/CreationBottomBar"
import HomeMap from "@/components/HomeMap"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createLocationPage } from "@/lib/actions/actions"
import { useCountries } from "@/lib/getCountries"
import React, { use, useState } from 'react'

// Client-Komponente: das `params`-Promise wird mit React `use()` ausgepackt.
const Page = ({params}: {params: Promise<{id: string}>}) => {
  const { id } = use(params)

  const { getAllCountries } = useCountries()
  const [locationValue, setLocationValue] = useState("")

  return (
    <>
      <div className="w-3/5 mx-auto mb-10">
        <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl transition-colors">
          Where is your Airbnb located?
        </h2>
      </div>

      <form action={createLocationPage}>
        <input type="hidden" name="homeId" value={id}/>
        <input type="hidden" name="countryValue" value={locationValue}/>
        <div className="w-3/5 mx-auto mb-36">
          <div className="mb-5">
            <Select required onValueChange={(value) => setLocationValue(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a country"/>
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
          </div>

          <HomeMap locationValue={locationValue}/>
        </div>

        <CreationBottomBar />
      </form>
    </>
  )
}

export default Page