import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Airbnb-Klon (Tutorial-Projekt)",
  description: "Airbnb-Klon mit Next.js 16, Prisma, Supabase und Kinde. Nach einem Video-Tutorial nachgebaut.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Navbar />
        {children}
      </body>
    </html>
  );
}
