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

const EXTRA_REMOTE_HOSTS = (process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function extraRemotePatterns() {
  return EXTRA_REMOTE_HOSTS.map((hostname) => ({
    protocol: "https" as const,
    hostname,
    pathname: "/**" as const,
  }));
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/favicon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, must-revalidate" }],
      },
    ];
  },
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
        protocol: "https",
        hostname: "s3.eu-central-003.backblazeb2.com",
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
      ...extraRemotePatterns(),
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
