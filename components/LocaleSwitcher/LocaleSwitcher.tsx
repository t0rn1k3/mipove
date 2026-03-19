"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, getPathname } from "@/i18n/navigation";
import styles from "./localeSwitcher.module.css";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ka", label: "KA" },
] as const;

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const switchLocale = (newLocale: "en" | "ka") => {
    if (newLocale === locale) return;

    const pathWithoutLocale = pathname.replace(/^\/(en|ka)(\/|$)/, "$2") || "/";
    const targetPath = getPathname({
      href: pathWithoutLocale,
      locale: newLocale,
      forcePrefix: true,
    });
    window.location.assign(targetPath);
  };

  return (
    <div className={styles.wrapper}>
      <Globe size={16} className={styles.globeIcon} aria-hidden />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => switchLocale(lang.code)}
          aria-pressed={locale === lang.code}
          className={`${styles.button} ${locale === lang.code ? styles.buttonActive : ""}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
