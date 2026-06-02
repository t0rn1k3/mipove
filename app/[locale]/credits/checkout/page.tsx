"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import CreditsCheckoutFlow from "@/components/CreditsCheckoutFlow/CreditsCheckoutFlow";
import styles from "./checkoutPage.module.css";

export default function CreditsCheckoutPage() {
  const t = useTranslations("credits");
  const params = useSearchParams();
  const packParam = params.get("pack");

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.backRow}>
          <Link href="/credits" className={styles.backLink}>
            {t("checkout.backToCredits")}
          </Link>
        </div>
        <section className={styles.card} aria-labelledby="credits-checkout-title">
          <h1 id="credits-checkout-title" className={styles.title}>
            {t("checkout.pageTitle")}
          </h1>
          <CreditsCheckoutFlow layout="page" initialPackId={packParam} />
        </section>
      </div>
    </main>
  );
}
