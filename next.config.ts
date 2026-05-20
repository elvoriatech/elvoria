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
    // Dev: Next/Turbopack HMR uses inline scripts. Prod: scripts load from 'self' only (see public/theme-init.js).
    const scriptSrc = isProd
      ? "'self'"
      : "'self' 'unsafe-inline' 'unsafe-eval'";
    const connectSrc = isProd ? "'self'" : "'self' ws: wss:";

    const csp = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: https://images.unsplash.com",
      "font-src 'self' data:",
      `connect-src ${connectSrc}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
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
