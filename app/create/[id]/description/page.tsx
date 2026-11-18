import CreationBottomBar from "@/components/CreationBottomBar"
import HomeDetailsFields from "@/components/HomeDetailsFields"
import { createDescriptionPage } from "@/lib/actions/actions"
import React from 'react'

// Seit Next 15/16 sind `params` ein Promise und müssen mit `await` gelesen werden.
const page = async ({params}: {params: Promise<{id: string}>}) => {
  const { id } = await params;

  return (
    <>
      <div className="w-3/5 mx-auto max-lg:w-full max-lg:px-5">
        <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl transition-colors">
          Please describe your home as good as you can!
        </h2>
      </div>

        <form action={createDescriptionPage}>
          <input type="hidden" name="homeId" value={id}/>
          <div className="mx-auto w-3/5 mt-10 mb-36 max-lg:w-full max-lg:px-5">
            <HomeDetailsFields />
          </div>

          <CreationBottomBar />
        </form>
    </>
  )
}

export default page
