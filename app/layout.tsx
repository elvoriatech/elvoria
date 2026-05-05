import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Sans, Inter } from "next/font/google";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { ProposalChatWidget } from "./components/ProposalChatWidget";
import "./globals.css";
import "./fonts.css";
import "./index.css";

const inter = Inter({
  variable: "--font-heading",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const THEME_INIT = `(function(){try{var k='elvoriatech:theme';var v=localStorage.getItem(k)||'elvoria-dark';if(v!=='elvoria-light')v='elvoria-dark';var root=document.documentElement;['dark','theme-elvoria'].forEach(function(c){root.classList.remove(c);});root.classList.add('theme-elvoria');if(v==='elvoria-light'){root.classList.remove('dark');}else{root.classList.add('dark');}}catch(e){}})();`;

function siteUrl(): string {
  const raw = (process.env.SITE_URL || "https://elvoriatech.com").trim();
  return raw.replace(/\/$/, "");
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Elvoriatech - AI-First Digital & Software Development Partner",
    template: "%s | Elvoriatech",
  },
  description: "Premium software development for startups and enterprises. We build SaaS platforms, AI solutions, and cloud-native applications.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Elvoriatech",
    title: "Elvoriatech - AI-First Digital & Software Development Partner",
    description:
      "Premium software development for startups and enterprises. We build SaaS platforms, AI solutions, and cloud-native applications.",
    images: [{ url: "/elvoria.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elvoriatech - AI-First Digital & Software Development Partner",
    description:
      "Premium software development for startups and enterprises. We build SaaS platforms, AI solutions, and cloud-native applications.",
    images: ["/elvoria.png"],
  },
  icons: {
    icon: [
      { url: "/elvoria.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/elvoria.png", "/favicon.ico"],
    apple: "/elvoria.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${plexSans.variable} theme-elvoria dark h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/png" href="/elvoria.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/elvoria.png" />
      </head>
      <body className="min-h-full overflow-x-hidden flex flex-col">
        <Script
          id="elvoria-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT }}
        />
        {children}
        <ProposalChatWidget />
        <ThemeSwitcher />
      </body>
    </html>
  );
}
