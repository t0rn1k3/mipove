"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import Logo from "@/components/logo/Logo";
import { Home, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./not-found.module.css";

export default function NotFound() {
  const t = useTranslations("notFound");
  const tCommon = useTranslations("common");
  const router = useRouter();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <Logo showText size={64} />
        </div>
        <p className={styles.status}>{t("status")}</p>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.message}>
          {t("message")}
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            <Home size={20} />
            {t("goHome")}
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.btnSecondary}
          >
            <ArrowLeft size={20} />
            {t("goBack")}
          </button>
        </div>
        <p className={styles.help}>
          {t("needHelp")}{" "}
          <a href="mailto:hello@mipove.ge" className={styles.helpLink}>
            {tCommon("contactUs")}
          </a>
        </p>
      </div>
    </main>
  );
}
