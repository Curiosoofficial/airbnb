import CountrySelect from "@/components/CountrySelect"
import CreationBottomBar from "@/components/CreationBottomBar"
import { createLocationPage } from "@/lib/actions/actions"

// Seit Next 15/16 sind `params` ein Promise und müssen mit `await` gelesen werden.
// Die Länderauswahl (mit State) steckt jetzt in CountrySelect, darum kann die
// Seite selbst eine Server-Komponente sein.
const Page = async ({params}: {params: Promise<{id: string}>}) => {
  const { id } = await params

  return (
    <>
      <div className="w-3/5 mx-auto mb-10 max-lg:w-full max-lg:px-5">
        <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl transition-colors">
          Where is your Airbnb located?
        </h2>
      </div>

      <form action={createLocationPage}>
        <input type="hidden" name="homeId" value={id}/>
        <div className="w-3/5 mx-auto mb-36 max-lg:w-full max-lg:px-5">
          <CountrySelect showMap/>
        </div>

        <CreationBottomBar />
      </form>
    </>
  )
}

export default Page
