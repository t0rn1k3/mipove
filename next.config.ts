import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_BASE = API_URL.replace(/\/api\/?$/, "") || "http://localhost:5000";

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
