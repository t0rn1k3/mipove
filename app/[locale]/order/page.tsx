"use client";

import { useTranslations } from "next-intl";
import styles from "./orderPage.module.css";

export default function OrderPage() {
  const t = useTranslations("order");

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.description}>{t("description")}</p>
      </div>
    </main>
  );
}
