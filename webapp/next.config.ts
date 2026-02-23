import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const tileservUrl = process.env.TILESERV_URL ?? "http://tileserv:7800";

    return [
      {
        source: "/tiles/:path*",
        destination: `${tileservUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
