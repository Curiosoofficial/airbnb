"use client"
import { useFormStatus } from "react-dom"
import { Button } from "./ui/button"
import { Heart, Loader2 } from "lucide-react"

const DeleteFromFavoriteButton = () => {
    const {pending} = useFormStatus()
    return (
      <>
          {pending ? (
              <Button variant="outline" size="icon" disabled className="bg-primary-foreground">
                  <Loader2 className="size-4 animate-spin text-primary"/>
              </Button>
          ): (
              <Button variant="outline" size="icon" className="bg-primary-foreground" type="submit">
                  <Heart className="size-4 text-primary" fill="#E21C49"/>
              </Button>
          )}
      </>
    )
}

export default DeleteFromFavoriteButton