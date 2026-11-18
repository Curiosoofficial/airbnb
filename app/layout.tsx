import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/Footer";
import FrameNotice from "@/components/FrameNotice";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Airbnb-Klon (Tutorial-Projekt)",
  description: "Airbnb-Klon mit Next.js 16, Prisma, Supabase und Kinde: Unterkünfte suchen, auf der Karte ansehen, buchen und selbst inserieren.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <FrameNotice />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
