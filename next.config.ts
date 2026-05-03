import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  /** Keep Puppeteer out of the server bundle trace. */
  serverExternalPackages: ["puppeteer"],
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
