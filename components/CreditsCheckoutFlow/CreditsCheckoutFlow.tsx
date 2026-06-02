"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { CreditPack } from "@/lib/types";
import { getCreditPacks, purchaseCredits } from "@/lib/api";
import { trackGaBeginCheckout } from "@/lib/analytics";
import styles from "./creditsCheckoutFlow.module.css";

export type CreditsCheckoutFlowProps = {
  layout: "modal" | "page";
  /** When set (e.g. `?pack=` on checkout page), preselect if the id exists after packs load */
  initialPackId?: string | null;
  onError?: (message: string) => void;
  /** Modal uses this to block dismiss while packs load or payment redirect starts */
  onBusyChange?: (busy: boolean) => void;
};

export default function CreditsCheckoutFlow({
  layout,
  initialPackId = null,
  onError,
  onBusyChange,
}: CreditsCheckoutFlowProps) {
  const t = useTranslations("credits");
  const tCommon = useTranslations("common");
  const onErrorRef = useRef(onError);
  const onBusyChangeRef = useRef(onBusyChange);

  onErrorRef.current = onError;
  onBusyChangeRef.current = onBusyChange;

  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [packsLoading, setPacksLoading] = useState(true);
  const [packsError, setPacksError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [invalidPackFromQuery, setInvalidPackFromQuery] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    setStep(1);
    setPurchaseError("");
  }, [initialPackId]);

  useEffect(() => {
    let cancelled = false;
    setPacksLoading(true);
    setPacksError("");
    getCreditPacks()
      .then((rows) => {
        if (cancelled) return;
        setPacks(rows);
        const want = typeof initialPackId === "string" ? initialPackId.trim() : "";
        if (!want) return;
        const match = rows.some((p) => p._id === want);
        if (match) {
          setSelectedId(want);
          setInvalidPackFromQuery(false);
        } else {
          setSelectedId(null);
          setInvalidPackFromQuery(rows.length > 0);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setPacks([]);
        const message = t("checkout.loadPacksError");
        setPacksError(message);
        onErrorRef.current?.(message);
      })
      .finally(() => {
        if (!cancelled) setPacksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialPackId, t]);

  const selected = useMemo(
    () => packs.find((p) => p._id === selectedId) ?? null,
    [packs, selectedId],
  );

  const rootClass =
    `${styles.root} ${layout === "page" ? styles.rootPage : styles.rootModal}`.trim();

  const busy = packsLoading || isPurchasing;

  useEffect(() => {
    onBusyChangeRef.current?.(busy);
  }, [busy]);

  const goReview = () => {
    if (!selectedId || !selected) return;
    setPurchaseError("");
    trackGaBeginCheckout({
      currency: "GEL",
      value: selected.priceGel,
      items: [
        {
          item_id: selected._id,
          item_name: selected.name,
          price: selected.priceGel,
          quantity: 1,
        },
      ],
    });
    setStep(2);
  };

  const goSelect = () => {
    setStep(1);
    setPurchaseError("");
  };

  const pay = async () => {
    if (!selectedId) return;
    setPurchaseError("");
    setIsPurchasing(true);
    try {
      const { paymentUrl } = await purchaseCredits(selectedId);
      window.location.href = paymentUrl;
    } catch {
      const message = t("checkout.purchaseError");
      setPurchaseError(message);
      onError?.(message);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className={rootClass}>
      <p className={styles.progress} aria-live="polite">
        {t("checkout.stepsProgress", { current: step, total: 2 })}
      </p>

      {packsLoading ? <p className={styles.meta}>{tCommon("loadingEllipsis")}</p> : null}
      {!packsLoading && packsError ? (
        <p className={`${styles.error} mipoveGuestText mipoveGuestText--errorLight`} role="alert">
          {packsError}
        </p>
      ) : null}
      {!packsLoading && !packsError && invalidPackFromQuery ? (
        <p className={`${styles.error} mipoveGuestText mipoveGuestText--errorLight`} role="status">
          {t("checkout.invalidPackParam")}
        </p>
      ) : null}

      {!packsLoading && !packsError && packs.length === 0 ? (
        <p className={styles.meta} role="status">
          {t("checkout.noPacks")}
        </p>
      ) : null}

      {!packsLoading && !packsError && packs.length > 0 ? (
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              <h4 className={styles.stepTitle}>{t("checkout.selectStepTitle")}</h4>
              <fieldset
                className={styles.fieldset}
                aria-label={t("checkout.radioGroupLabel")}
              >
                <div className={styles.radiogroup}>
                  {packs.map((pack) => {
                    const isSelected = pack._id === selectedId;
                    return (
                      <button
                        key={pack._id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={busy}
                        className={`${styles.packOption} ${isSelected ? styles.packOptionSelected : ""}`}
                        onClick={() => setSelectedId(pack._id)}
                      >
                        <p className={styles.packName}>{pack.name}</p>
                        <p className={styles.packMeta}>
                          {t("checkout.packCreditsLine", {
                            credits: pack.credits,
                            bonus: pack.bonusCredits,
                          })}
                        </p>
                        <p className={styles.packPrice}>₾{pack.priceGel}</p>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              {!selectedId ? (
                <p className={styles.hint}>{t("checkout.selectPackPrompt")}</p>
              ) : null}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={!selectedId || busy}
                  onClick={goReview}
                >
                  {t("checkout.continueToReview")}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
            >
              <h4 className={styles.stepTitle}>{t("checkout.reviewStepTitle")}</h4>
              {selected ? (
                <div className={styles.summary}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{t("checkout.summaryPack")}</span>
                    <span className={styles.summaryValue}>{selected.name}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{t("checkout.summaryCredits")}</span>
                    <span className={styles.summaryValue}>
                      {t("checkout.packCreditsLine", {
                        credits: selected.credits,
                        bonus: selected.bonusCredits,
                      })}
                    </span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                    <span className={styles.summaryLabel}>{t("checkout.total")}</span>
                    <span className={styles.summaryValue}>₾{selected.priceGel}</span>
                  </div>
                </div>
              ) : null}
              <p className={styles.secureNote}>{t("checkout.secureNote")}</p>
              {purchaseError ? (
                <p className={`${styles.error} mipoveGuestText mipoveGuestText--errorLight`} role="alert">
                  {purchaseError}
                </p>
              ) : null}
              <div className={`${styles.actions} ${styles.actionsReview}`}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  disabled={busy}
                  onClick={goSelect}
                >
                  {t("checkout.backToSelection")}
                </button>
                <button
                  type="button"
                  className={`${styles.btnPrimary} ${styles.payWideEnd}`}
                  disabled={busy || !selectedId}
                  onClick={() => void pay()}
                >
                  {isPurchasing ? t("checkout.processing") : t("checkout.continueToPayment")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : null}
    </div>
  );
}
