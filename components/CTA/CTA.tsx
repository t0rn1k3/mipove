"use client";

import { Link } from "@/i18n/navigation";
import styles from "./cta.module.css";
import { useTranslations } from "next-intl";

export default function CTA() {
  const t = useTranslations("cta");
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t("title")}</h2>
        <div className={styles.buttons}>
          <Link href="/masters" className={styles.buttonPrimary}>
            {t("exploreGallery")}
          </Link>
          <Link href="/join" className={styles.buttonSecondary}>
            {t("joinProfessional")}
          </Link>
        </div>
      </div>
    </section>
  );
}
