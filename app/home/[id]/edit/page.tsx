import EditHomeForm from "@/components/EditHomeForm";
import prisma from "@/db/db";
import { getImageUrl } from "@/lib/imageUrl";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit listing | Airbnb-Klon",
};

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect(`/api/auth/login?post_login_redirect_url=${encodeURIComponent(`/api/auth/creation?next=/home/${id}/edit`)}`);
  }

  // `userId` im where: Fremde Inserate gibt es für diese Seite nicht (404)
  const home = await prisma.home.findUnique({
    where: { id, userId: user.id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      guests: true,
      bedrooms: true,
      bathrooms: true,
      categoryName: true,
      country: true,
      city: true,
      latitude: true,
      longitude: true,
      amenities: true,
      photo: true,
    },
  });

  if (!home) {
    notFound();
  }

  return (
    <div className="w-3/5 mx-auto my-10 max-lg:w-full max-lg:px-5">
      <h1 className="text-3xl font-semibold tracking-tight max-lg:text-xl mb-8">Edit your listing</h1>
      <EditHomeForm home={home} imageUrl={getImageUrl(home.photo)}/>
    </div>
  );
};

export default page;
