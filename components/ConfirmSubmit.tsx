"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "./ui/button"

interface Props {
  label: string
  confirmLabel: string
  question: string
}

// Zweistufiger Knopf für Aktionen, die man nicht rückgängig machen kann
// (Stornieren, Löschen). Ein eigener Zwischenschritt statt window.confirm():
// passt ins Design und funktioniert auch auf dem Handy sauber.
const ConfirmSubmit = ({ label, confirmLabel, question }: Props) => {
  const [confirming, setConfirming] = useState(false)
  const { pending } = useFormStatus()

  if (!confirming) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)}>
        {label}
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">{question}</span>
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin"/> : confirmLabel}
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => setConfirming(false)}>
        Keep
      </Button>
    </div>
  )
}

export default ConfirmSubmit
