"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import styles from "./localeSwitcher.module.css";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: "en" | "ka") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        aria-pressed={locale === "en"}
        className={`${styles.button} ${locale === "en" ? styles.buttonActive : ""}`}
      >
        EN
      </button>
      <span className={styles.separator} aria-hidden>|</span>
      <button
        type="button"
        onClick={() => switchLocale("ka")}
        aria-pressed={locale === "ka"}
        className={`${styles.button} ${locale === "ka" ? styles.buttonActive : ""}`}
      >
        KA
      </button>
    </div>
  );
}
