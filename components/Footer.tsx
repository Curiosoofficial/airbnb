import Link from "next/link"

const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="container mx-auto flex flex-col gap-y-2 px-5 py-8 text-sm text-muted-foreground lg:px-10 md:flex-row md:items-center md:justify-between">
        <p>
          Airbnb clone · learning project, built from a video tutorial and extended. Not a real offer, no payments.
        </p>
        <div className="flex gap-x-4">
          <a href="https://github.com/Curiosoofficial/airbnb" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
            Code on GitHub
          </a>
          <Link href="/reservations" className="hover:text-foreground hover:underline">My Trips</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
