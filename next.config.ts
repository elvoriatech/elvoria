import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  /** Keep Puppeteer out of the server bundle trace. */
  serverExternalPackages: ["puppeteer", "mermaid"],
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    // CSP is set per-request in middleware.ts (nonce + strict-dynamic for Next.js inline scripts).

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          // Enable HSTS only when you're sure your domain is always HTTPS.
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/elvoria.png" },
    ];
  },
};

export default nextConfig;
