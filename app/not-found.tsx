import { Button } from "@/components/ui/button"
import Link from "next/link"

// Eigene 404-Seite statt der Standard-Seite von Next.js
const NotFound = () => {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-y-4 px-5 text-center">
      <p className="text-7xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold">We can&apos;t seem to find this page</h1>
      <p className="text-muted-foreground">The listing may have been removed, or the link is wrong.</p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/">Back to all homes</Link>
      </Button>
    </div>
  )
}

export default NotFound
