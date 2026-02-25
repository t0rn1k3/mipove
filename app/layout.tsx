import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import Navbar from "@/components/navbar/Navbar";

const sharpe = localFont({
  src: "../public/fonts/SharpePERSONAL-Bold.woff2",
  variable: "--font-sharpe",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mipove",
  description: "Mipove is a platform for professionals in different fields",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${sharpe.variable} ${barlow.variable} font-sans`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
