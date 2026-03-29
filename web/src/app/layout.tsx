import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Providers } from "@/components/providers";
import { wagmiConfig } from "@/lib/wagmi-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://zoop-pi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Zoop",
  description: "Neon grid puzzler on Base — swipe to collect Zoop orbs.",
  icons: { icon: "/icon.svg", apple: "/app-icon.png" },
  openGraph: {
    title: "Zoop",
    description: "Mobile-first grid game on Base.",
    images: ["/og-zoop.svg"],
  },
  other: baseAppId ? { "base:app_id": baseAppId } : {},
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const cookie = headerList.get("cookie");
  const initialState = cookieToInitialState(wagmiConfig, cookie ?? undefined);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      >
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
