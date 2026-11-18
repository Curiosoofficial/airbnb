"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

// Fängt unerwartete Fehler ab (z. B. Datenbank kurz nicht erreichbar),
// statt die ganze Seite weiss zu lassen.
const ErrorPage = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-y-4 px-5 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">Please try again. If it keeps happening, come back in a minute.</p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}

export default ErrorPage
