// app/layout.tsx - Simplified root layout for landing page
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KickHub - Grassroots Football Management",
  description: "The complete team management platform for UK coaches, parents, and players. Transform your grassroots football team with modern tools.",
  keywords: ["football", "grassroots", "team management", "coaching", "UK football", "youth football"],
  authors: [{ name: "KickHub Team" }],
  creator: "KickHub",
  publisher: "KickHub",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://kickhub.com",
    siteName: "KickHub",
    title: "KickHub - Transform Your Grassroots Football Team",
    description: "The complete team management platform built for UK coaches, parents, and players. From muddy pitches to match day magic.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KickHub - Grassroots Football Management",
    description: "Transform your grassroots football team with modern management tools.",
    creator: "@kickhubapp",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}