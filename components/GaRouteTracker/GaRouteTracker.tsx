"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

type GaRouteTrackerProps = {
  gaId: string;
};

/**
 * First page view comes from `GoogleAnalytics`’s initial `gtag('config', gaId)`.
 * Subsequent App Router navigations need `config` + `page_path` so GA4 sees SPA views.
 */
export function GaRouteTracker({ gaId }: GaRouteTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipFirstSpaSync = useRef(true);

  useEffect(() => {
    const search = searchParams?.toString();
    const pagePath = search ? `${pathname}?${search}` : pathname;

    if (skipFirstSpaSync.current) {
      skipFirstSpaSync.current = false;
      return;
    }

    if (typeof window.gtag !== "function") return;
    window.gtag("config", gaId, {
      page_path: pagePath,
    });
  }, [pathname, searchParams, gaId]);

  return null;
}
