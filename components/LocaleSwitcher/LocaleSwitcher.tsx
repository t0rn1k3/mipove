"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocaleSwitch } from "@/components/LocaleProvider/LocaleProvider";
import type { AppLocale } from "@/lib/types";

import styles from "./localeSwitcher.module.css";

const LANGUAGES = [
  { code: "ka" as const, label: "ქარ" },
  { code: "en" as const, label: "EN" },
];

export default function LocaleSwitcher() {
  const t = useTranslations("nav");
  const { locale, setLocale } = useLocaleSwitch();

  const active = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[1];

  const toggle = () => {
    const next: AppLocale = locale === "ka" ? "en" : "ka";
    setLocale(next);
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={t("languageToggle")}
    >
      <Globe size={16} className={styles.globeIcon} aria-hidden />
      <span className={styles.label}>{active.label}</span>
    </button>
  );
}
