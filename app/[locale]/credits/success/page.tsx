"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCreditBalance } from "@/lib/api";
import { useCreditBalance } from "@/components/CreditBalanceContext/CreditBalanceContext";
import styles from "./successPage.module.css";

export default function CreditsSuccessPage() {
  const tCredits = useTranslations("credits");
  const tCommon = useTranslations("common");
  const params = useSearchParams();
  const status = params.get("status");
  const failed = status === "failed";
  const { setBalance } = useCreditBalance();

  const [loading, setLoading] = useState(!failed);
  const [error, setError] = useState("");
  const [balance, setLocalBalance] = useState<number | null>(null);

  useEffect(() => {
    if (failed) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    getCreditBalance()
      .then(({ balance: nextBalance }) => {
        if (cancelled) return;
        setLocalBalance(nextBalance);
        setBalance(nextBalance);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to refresh credits");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [failed, setBalance]);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>
          {failed ? tCredits("paymentFailedTitle") : tCredits("paymentSuccessTitle")}
        </h1>
        <p className={styles.desc}>
          {failed ? tCredits("paymentFailedDesc") : tCredits("paymentSuccessDesc")}
        </p>

        {!failed && loading ? <p className={styles.meta}>{tCommon("loading")}...</p> : null}
        {!failed && error ? <p className={styles.error}>{error}</p> : null}
        {!failed && !loading && !error && balance !== null ? (
          <p className={styles.balanceLine}>
            {tCredits("balance")}: <strong>{balance}</strong>
          </p>
        ) : null}

        <Link href="/order" className={styles.ctaBtn}>
          {tCredits("backToOrders")}
        </Link>
      </section>
    </main>
  );
}
