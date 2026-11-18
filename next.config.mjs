/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // `domains` ist veraltet. `remotePatterns` erlaubt gezielt Host + Pfad.
    // Früher war hier nur das alte Supabase-Projekt eingetragen. Mit
    // `*.supabase.co` funktioniert jedes Supabase-Projekt (auch Lukas eigenes).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "a0.muscache.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Standard sind 1 MB. Handyfotos sind grösser, der Upload brach ab.
      // Vercel erlaubt max. 4.5 MB pro Request.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
