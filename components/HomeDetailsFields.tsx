import Counter from "./Counter"
import { Card, CardHeader } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

interface Props {
  defaults?: {
    title?: string | null
    description?: string | null
    price?: number | null
    guests?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
  }
  // Beim Erstellen ist ein Bild Pflicht, beim Bearbeiten optional
  imageRequired?: boolean
}

// Gemeinsame Felder für "Inserat erstellen" (Schritt 2) und "Inserat bearbeiten"
const HomeDetailsFields = ({ defaults = {}, imageRequired = true }: Props) => {
  const counters = [
    { name: "guest", title: "Guests", text: "How many guests can stay at your Airbnb?", value: defaults.guests },
    { name: "room", title: "Rooms", text: "How many rooms do you have?", value: defaults.bedrooms },
    { name: "bathroom", title: "Bathrooms", text: "How many bathrooms do you have?", value: defaults.bathrooms },
  ]

  return (
    <div className="flex flex-col gap-y-5">
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" type="text" name="title" required maxLength={80} placeholder="Your Title..." defaultValue={defaults.title ?? undefined}/>
      </div>

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required maxLength={1000} rows={5} placeholder="Please describe your Airbnb..." defaultValue={defaults.description ?? undefined}/>
      </div>

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="price">Price per night (USD)</Label>
        <Input id="price" name="price" type="number" required placeholder="Price Per Night" min={10} max={10000} step={1} defaultValue={defaults.price ?? undefined}/>
      </div>

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="image">{imageRequired ? "Image" : "New image (optional)"}</Label>
        <Input id="image" name="image" type="file" accept="image/*" required={imageRequired}/>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP, max. 4 MB</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-y-5">
          {counters.map((counter) => (
            <div key={counter.name} className="flex items-center justify-between max-lg:flex-col max-lg:items-start max-lg:gap-y-2">
              <div className="flex flex-col">
                <h3 className="underline font-medium">{counter.title}</h3>
                <p className="text-muted-foreground text-sm">{counter.text}</p>
              </div>
              <Counter name={counter.name} defaultValue={counter.value ?? 1}/>
            </div>
          ))}
        </CardHeader>
      </Card>
    </div>
  )
}

export default HomeDetailsFields
