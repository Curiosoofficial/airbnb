import { Skeleton } from "@/components/ui/skeleton"


const loading = () => {
  return (
    <section className="container mx-auto px-5 lg:px-10 mt-10">
        <h2 className="text-3xl font-semibold tracking-tight max-lg:text-xl">Upcoming trips</h2>

        <div className="grid xl:grid-cols-2 gap-6 mt-8">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
        </div>
    </section>
  )
}

export default loading
