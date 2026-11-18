import CreationBottomBar from "@/components/CreationBottomBar"
import LocationPicker from "@/components/LocationPicker"
import { createLocationPage } from "@/lib/actions/actions"

// Seit Next 15/16 sind `params` ein Promise und müssen mit `await` gelesen werden.
// Der Ort wird jetzt gesucht (Stadt oder Adresse) statt aus 250 Ländern gewählt.
const Page = async ({params}: {params: Promise<{id: string}>}) => {
  const { id } = await params

  return (
    <>
      <div className="w-3/5 mx-auto mb-10 max-lg:w-full max-lg:px-5">
        <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl transition-colors">
          Where is your Airbnb located?
        </h2>
        <p className="mt-2 text-muted-foreground">Search for the town or the address of your place.</p>
      </div>

      <form action={createLocationPage}>
        <input type="hidden" name="homeId" value={id}/>
        <div className="w-3/5 mx-auto mb-36 max-lg:w-full max-lg:px-5">
          <LocationPicker/>
        </div>

        <CreationBottomBar />
      </form>
    </>
  )
}

export default Page
