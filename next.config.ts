import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_BASE = API_URL.replace(/\/api\/?$/, "") || "http://localhost:5000";


function apiHostImagePattern(): {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
} | null {
  try {
    const u = new URL(API_BASE);
    const entry: {
      protocol: "http" | "https";
      hostname: string;
      port?: string;
      pathname: string;
    } = {
      protocol: u.protocol === "https:" ? "https" : "http",
      hostname: u.hostname,
      pathname: "/**",
    };
    if (u.port) entry.port = u.port;
    return entry;
  } catch {
    return null;
  }
}

const apiPattern = apiHostImagePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
        port: "5000",
      },
      ...(apiPattern &&
      !(
        apiPattern.hostname === "localhost" &&
        (!apiPattern.port || apiPattern.port === "5000")
      )
        ? [apiPattern]
        : []),
    ],
    // Next/Image blocks private/reserved IPs by default (SSRF protection).
    // Our dev backend serves uploads from localhost:5000, so allow it in development.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${API_BASE}/uploads/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
