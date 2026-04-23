import { GaRouteTracker } from "@/components/GaRouteTracker/GaRouteTracker";
import { LocaleProvider } from "@/components/LocaleProvider/LocaleProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getLocale, getTimeZone } from "next-intl/server";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

const loadGoogleAnalytics =
  process.env.NODE_ENV === "production" && Boolean(gaMeasurementId);

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
  const timeZone = await getTimeZone();
  const [enMessages, kaMessages] = await Promise.all([
    import("../messages/en.json").then((m) => m.default),
    import("../messages/ka.json").then((m) => m.default),
  ]);

  return (
    <html lang={locale}>
      <body className={`${sharpe.variable} ${playfair.variable} ${inter.variable}`}>
        {/*
          EU/GDPR: obtain consent before loading GA for EEA users, or wire Consent Mode v2
          + a CMP when you add a cookie banner (see docs/ga4.md).
        */}
        {loadGoogleAnalytics && gaMeasurementId ? (
          <>
            <GoogleAnalytics gaId={gaMeasurementId} />
            <Suspense fallback={null}>
              <GaRouteTracker gaId={gaMeasurementId} />
            </Suspense>
          </>
        ) : null}
        <LocaleProvider
          initialLocale={locale}
          timeZone={timeZone}
          enMessages={enMessages}
          kaMessages={kaMessages}
        >
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
