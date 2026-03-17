import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import ConditionalNavbar from "@/components/ConditionalNavbar";

const sharpe = localFont({
  src: "../public/fonts/SharpePERSONAL-Bold.woff2",
  variable: "--font-sharpe",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mipove",
  description: "Mipove is a platform for masters in different fields",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${sharpe.variable} ${playfair.variable} ${inter.variable}`}>
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  );
}
