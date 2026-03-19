"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: "en" | "ka") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        aria-pressed={locale === "en"}
        style={{
          padding: "0.25rem 0.5rem",
          fontWeight: locale === "en" ? 600 : 400,
          opacity: locale === "en" ? 1 : 0.7,
        }}
      >
        EN
      </button>
      <span aria-hidden>|</span>
      <button
        type="button"
        onClick={() => switchLocale("ka")}
        aria-pressed={locale === "ka"}
        style={{
          padding: "0.25rem 0.5rem",
          fontWeight: locale === "ka" ? 600 : 400,
          opacity: locale === "ka" ? 1 : 0.7,
        }}
      >
        KA
      </button>
    </div>
  );
}
