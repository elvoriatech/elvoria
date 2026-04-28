import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
