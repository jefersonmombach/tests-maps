import type { NextConfig } from "next";

// Static export is used when building the Docker image (production).
// In development the Next.js server handles the /tiles/* proxy via rewrites.
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? { output: "export", trailingSlash: true }
    : {
        async rewrites() {
          const tileservUrl =
            process.env.TILESERV_URL ?? "http://tileserv:7800";
          return [
            { source: "/tiles/:path*", destination: `${tileservUrl}/:path*` },
          ];
        },
      }),
};

export default nextConfig;
