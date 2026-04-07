"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getCreditHistory, getMe } from "@/lib/api";
import type { CreditTransaction } from "@/lib/types";
import BuyCreditsModal from "@/components/BuyCreditsModal/BuyCreditsModal";
import styles from "./creditsPage.module.css";

export default function CreditsPage() {
  const tCredits = useTranslations("credits");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([getMe(), getCreditHistory(1, 30)])
      .then(([me, history]) => {
        if (cancelled) return;
        setIsMaster(me.data.role === "master");
        setTransactions(history.transactions);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load credit history");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{tCredits("history")}</h1>
          {isMaster ? (
            <button type="button" className={styles.buyBtn} onClick={() => setBuyCreditsOpen(true)}>
              {tCredits("buy")}
            </button>
          ) : null}
        </div>

        {loading ? <p className={styles.meta}>{tCommon("loading")}...</p> : null}
        {!loading && error ? <p className={styles.error}>{error}</p> : null}
        {!loading && !error && transactions.length === 0 ? (
          <p className={styles.meta}>{tCredits("history")}: 0</p>
        ) : null}

        {!loading && !error && transactions.length > 0 ? (
          <div className={styles.list}>
            {transactions.map((tx) => (
              <article key={tx._id} className={styles.txRow}>
                <div>
                  <p className={styles.txType}>{tCredits(`transaction.${tx.type}` as never)}</p>
                  <p className={styles.txDate}>{new Date(tx.createdAt).toLocaleString()}</p>
                </div>
                <div className={styles.txRight}>
                  <p className={`${styles.txAmount} ${tx.amount >= 0 ? styles.plus : styles.minus}`}>
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.amount}
                  </p>
                  <p className={styles.txBalance}>= {tx.balanceAfter}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {toast ? <div className={styles.toast}>{toast}</div> : null}
      <BuyCreditsModal
        open={buyCreditsOpen}
        onClose={() => setBuyCreditsOpen(false)}
        onError={(message) => setToast(message)}
      />
    </main>
  );
}
