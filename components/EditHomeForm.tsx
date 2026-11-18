"use client"

import { updateHome } from "@/lib/actions/actions"
import type { FormState } from "@/lib/types"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import HomeDetailsFields from "./HomeDetailsFields"
import LocationPicker from "./LocationPicker"
import SelectCategory from "./SelectCategory"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"

interface Props {
  home: {
    id: string
    title: string | null
    description: string | null
    price: number | null
    guests: number | null
    bedrooms: number | null
    bathrooms: number | null
    categoryName: string | null
    country: string | null
    city: string | null
    latitude: number | null
    longitude: number | null
    amenities: string[]
  }
  // Fertige Bild-URL vom Server: SUPABASE_URL gibt es im Browser nicht
  imageUrl: string
}

const SaveButton = () => {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 size-4 animate-spin"/> Saving...</> : "Save changes"}
    </Button>
  )
}

const EditHomeForm = ({ home, imageUrl }: Props) => {
  const [state, formAction] = useActionState<FormState, FormData>(updateHome, null)

  return (
    <form action={formAction} className="flex flex-col gap-y-8">
      <input type="hidden" name="homeId" value={home.id}/>

      <section>
        <h2 className="text-xl font-semibold">Category</h2>
        <SelectCategory defaultValue={home.categoryName ?? undefined} className="w-full mx-0 mt-4 mb-0 gap-4"/>
      </section>

      <Separator/>

      <section className="flex flex-col gap-y-4">
        <h2 className="text-xl font-semibold">Details</h2>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-36 shrink-0">
            <Image src={imageUrl} alt="Current image" fill sizes="144px" className="rounded-lg object-cover"/>
          </div>
          <p className="text-sm text-muted-foreground">Current image. Choose a new file below to replace it.</p>
        </div>
        <HomeDetailsFields defaults={home} imageRequired={false}/>
      </section>

      <Separator/>

      <section className="flex flex-col gap-y-4">
        <h2 className="text-xl font-semibold">Location</h2>
        <LocationPicker
          defaultValue={{
            city: home.city ?? undefined,
            country: home.country ?? undefined,
            latitude: home.latitude ?? undefined,
            longitude: home.longitude ?? undefined,
          }}
        />
      </section>

      {state?.error && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex justify-between border-t pt-6">
        <Button asChild variant="secondary" size="lg">
          <Link href="/my-homes">Cancel</Link>
        </Button>
        <SaveButton/>
      </div>
    </form>
  )
}

export default EditHomeForm
