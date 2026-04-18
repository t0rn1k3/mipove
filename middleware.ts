import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** `false` so first visit uses `defaultLocale` (ka), not the browser’s Accept-Language. */
export default createMiddleware({
  ...routing,
  localeDetection: false,
});

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
