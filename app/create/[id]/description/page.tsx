import Counter from "@/components/Counter"
import CreationBottomBar from "@/components/CreationBottomBar"
import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createDescriptionPage } from "@/lib/actions/actions"
import React from 'react'

const page = ({params}: {params: {id: string}}) => {

  return (
    <>
      <div className="w-3/5 mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl transition-colors">
          Please describe your home as good as you can!
        </h2>
        
      </div>

        <form action={createDescriptionPage}>
          <input type="hidden" name="homeId" value={params.id}/>
          <div className="mx-auto w-3/5 mt-10 flex flex-col gap-y-5 mb-36">
            <div className="flex flex-col gap-y-2">
              <Label>Titel</Label>
              <Input type="text" name="title" required placeholder="Your Title..."/>
            </div>

            <div className="flex flex-col gap-y-2">
            <Label>Description</Label>
            <Textarea name="description" required placeholder="Please describe your Airbnb..."/>
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>Price</Label>
              <Input name="price" type="number" required placeholder="Price Per Night" min={10}/>
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>Image</Label>
              <Input name="image" type="file" required />
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-y-5">
                <div className="flex items-center justify-between max-lg:flex-col max-lg:items-start">
                  <div className="flex flex-col">
                    <h3 className="underline font-medium">Guests</h3>
                    <p className="text-muted-foreground text-sm">How many guests can stay at your Airbnb?</p>
                  </div>
                  <Counter name="guest"/>
                </div>

                <div className="flex items-center justify-between max-lg:flex-col max-lg:items-start">
                  <div className="flex flex-col">
                    <h3 className="underline font-medium">Rooms</h3>
                    <p className="text-muted-foreground text-sm">How many rooms do you have?</p>
                  </div>
                  <Counter name="room"/>
                </div>

                <div className="flex items-center justify-between max-lg:flex-col max-lg:items-start">
                  <div className="flex flex-col">
                    <h3 className="underline font-medium">Bathrooms</h3>
                    <p className="text-muted-foreground text-sm">How many Badhrooms do you have?</p>
                  </div>
                  <Counter name="bathroom"/>
                </div>
              </CardHeader>
            </Card>
          </div>

          <CreationBottomBar />
        </form>
      
    </>
  )
}

export default page

