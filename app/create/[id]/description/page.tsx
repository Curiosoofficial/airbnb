import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import React from 'react'

const page = () => {
  return (
    <>
      <div className="w-3/5 mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl transition-colors">
          Please describe your home as good as you can!
        </h2>

        <form action="">
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
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="underline font-medium">Guests</h3>
                    <p className="text-muted-foreground text-sm">How many guests can stay at your Airbnb?</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

          </div>
        </form>
      </div>
    </>
  )
}

export default page