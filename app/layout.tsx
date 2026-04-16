import { LocaleProvider } from "@/components/LocaleProvider/LocaleProvider";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_FRONTEND_URL?.trim() || "http://localhost:3000",
  ),
  title: "Mipove",
  description: "Mipove is a platform for masters in different fields",
  /** Explicit so browsers/CDNs don’t keep the default Next tab icon */
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as "en" | "ka";
  const [enMessages, kaMessages] = await Promise.all([
    import("../messages/en.json").then((m) => m.default),
    import("../messages/ka.json").then((m) => m.default),
  ]);

  return (
    <html lang={locale}>
      <body className={`${sharpe.variable} ${playfair.variable} ${inter.variable}`}>
        <LocaleProvider
          initialLocale={locale}
          enMessages={enMessages}
          kaMessages={kaMessages}
        >
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
