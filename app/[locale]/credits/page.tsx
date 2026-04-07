"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getCreditBalance, getCreditHistory, getMe } from "@/lib/api";
import type { CreditTransaction } from "@/lib/types";
import BuyCreditsModal from "@/components/BuyCreditsModal/BuyCreditsModal";
import { useCreditBalance } from "@/components/CreditBalanceContext/CreditBalanceContext";
import styles from "./credits.module.css";

const PAGE_SIZE = 20;

function formatTxDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function normalizeActionSlug(action: string): string {
  return action
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export default function CreditsPage() {
  const tCredits = useTranslations("credits");
  const tCommon = useTranslations("common");
  const { setBalance: setContextBalance } = useCreditBalance();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [toast, setToast] = useState("");

  const formatActionLabel = (action: string) => {
    const slug = normalizeActionSlug(action);
    if (slug === "view_contact") return tCredits("actions.view_contact");
    if (slug === "registration") return tCredits("actions.registration");
    const pretty = action.replace(/_/g, " ").trim();
    return pretty.length > 0 ? pretty : "—";
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = await getMe();
      const master = me.data.role === "master";
      setIsMaster(master);

      const [history, balRes] = await Promise.all([
        getCreditHistory(page, PAGE_SIZE),
        master ? getCreditBalance() : Promise.resolve(null),
      ]);

      setTransactions(history.transactions);
      setPages(Math.max(1, history.pages));

      if (balRes) {
        setBalance(balRes.balance);
        setContextBalance(balRes.balance);
      } else if (!master) {
        setBalance(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load credits");
      setTransactions([]);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, setContextBalance]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.balanceCard}>
          <div>
            <p className={styles.balanceLabel}>{tCredits("balance")}</p>
            <div className={styles.balanceRow}>
              {loading ? (
                <p className={styles.balanceValue} aria-busy>
                  …
                </p>
              ) : isMaster && balance !== null ? (
                <p className={styles.balanceValue}>{balance}</p>
              ) : (
                <p className={styles.balanceValue}>—</p>
              )}
              {isMaster ? (
                <button
                  type="button"
                  className={styles.buyMoreBtn}
                  onClick={() => setBuyCreditsOpen(true)}
                  disabled={loading}
                >
                  {tCredits("buyMore")}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className={styles.historyCard}>
          <h2 className={styles.historyTitle}>{tCredits("history")}</h2>
          {loading ? <p className={styles.meta}>{tCommon("loading")}...</p> : null}
          {!loading && error ? <p className={styles.error}>{error}</p> : null}
          {!loading && !error && transactions.length === 0 ? (
            <p className={styles.empty}>{tCredits("emptyTransactions")}</p>
          ) : null}

          {!loading && !error && transactions.length > 0 ? (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{tCredits("colDate")}</th>
                      <th>{tCredits("colType")}</th>
                      <th>{tCredits("colAction")}</th>
                      <th>{tCredits("colAmount")}</th>
                      <th>{tCredits("colBalance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td className={styles.cellMuted}>{formatTxDate(tx.createdAt)}</td>
                        <td>{tCredits(`transaction.${tx.type}` as never)}</td>
                        <td>{formatActionLabel(tx.action)}</td>
                        <td className={tx.amount >= 0 ? styles.amountPlus : styles.amountMinus}>
                          {tx.amount >= 0 ? "+" : ""}
                          {tx.amount}
                        </td>
                        <td>{tx.balanceAfter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pages > 1 ? (
                <div className={styles.pager}>
                  <span className={styles.pagerInfo}>
                    {tCredits("pageIndicator", { page, pages })}
                  </span>
                  <button
                    type="button"
                    className={styles.pagerBtn}
                    disabled={!canPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {tCredits("pagePrev")}
                  </button>
                  <button
                    type="button"
                    className={styles.pagerBtn}
                    disabled={!canNext}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  >
                    {tCredits("pageNext")}
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </div>

      {toast ? <div className={styles.toast}>{toast}</div> : null}
      <BuyCreditsModal
        open={buyCreditsOpen}
        onClose={() => setBuyCreditsOpen(false)}
        onError={(message) => setToast(message)}
      />
    </main>
  );
}
