"use client"

import { useIsFramed } from "@/lib/hooks"
import { ExternalLink } from "lucide-react"

// Läuft die Seite in einem iframe (z. B. als Demo im Portfolio), klappt der
// Login nicht: Die Kinde-Loginseite verbietet das Einbetten
// (X-Frame-Options: deny). Darum ein Hinweis mit Link in einem neuen Tab.
const FrameNotice = () => {
  const framed = useIsFramed()

  if (!framed) return null

  return (
    <div className="bg-foreground text-background text-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-2 px-5 py-2 text-center">
        <span>You&apos;re viewing an embedded demo. To sign in, book or save homes,</span>
        <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium underline">
          open it in a new tab <ExternalLink className="size-3.5"/>
        </a>
      </div>
    </div>
  )
}

export default FrameNotice
