"use client"
import { useFormStatus } from "react-dom"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"


const SubmitButtons = () => {
    const {pending} = useFormStatus()
  return (
    <>
        {pending ? (
            <Button disabled size="lg">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Submitting...
            </Button>
        ): (
            <Button type="submit" size="lg">Next</Button>
        )}
    </>
  )
}

export default SubmitButtons