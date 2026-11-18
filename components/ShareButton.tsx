"use client"

import { Check, Share } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"

// Teilen wie bei Airbnb: auf dem Handy das System-Menü (Web Share API),
// sonst wird der Link in die Zwischenablage kopiert.
const ShareButton = ({ title }: { title: string }) => {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // Abgebrochen: dann eben kopieren
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button type="button" variant="ghost" size="sm" className="underline" onClick={share}>
      {copied ? <Check className="mr-2 size-4"/> : <Share className="mr-2 size-4"/>}
      {copied ? "Link copied" : "Share"}
    </Button>
  )
}

export default ShareButton
