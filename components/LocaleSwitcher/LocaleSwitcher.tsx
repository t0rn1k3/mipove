"use client";

import { Globe } from "lucide-react";
import { useLocaleSwitch } from "@/components/LocaleProvider/LocaleProvider";
import styles from "./localeSwitcher.module.css";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ka", label: "KA" },
] as const;

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleSwitch();

  return (
    <div className={styles.wrapper}>
      <Globe size={16} className={styles.globeIcon} aria-hidden />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLocale(lang.code)}
          aria-pressed={locale === lang.code}
          className={`${styles.button} ${locale === lang.code ? styles.buttonActive : ""}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
