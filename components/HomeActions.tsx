"use client"

import { deleteHome } from "@/lib/actions/actions"
import type { FormState } from "@/lib/types"
import { Pencil } from "lucide-react"
import Link from "next/link"
import { useActionState } from "react"
import ConfirmSubmit from "./ConfirmSubmit"
import { Button } from "./ui/button"

// Bearbeiten und Löschen unter einem eigenen Inserat (Seite "My Listings")
const HomeActions = ({ homeId }: { homeId: string }) => {
  const [state, formAction] = useActionState<FormState, FormData>(deleteHome, null)

  return (
    <div className="mt-3 flex flex-col gap-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/home/${homeId}/edit`}>
            <Pencil className="mr-2 size-3.5"/> Edit
          </Link>
        </Button>
        <form action={formAction}>
          <input type="hidden" name="homeId" value={homeId}/>
          <ConfirmSubmit label="Delete" confirmLabel="Yes, delete" question="Delete this listing?"/>
        </form>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">{state.error}</p>
      )}
    </div>
  )
}

export default HomeActions
