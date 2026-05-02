import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/elvoria.png" },
    ];
  },
};

export default nextConfig;
