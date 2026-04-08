"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import type { CreditPack } from "@/lib/types";
import { getCreditPacks, purchaseCredits } from "@/lib/api";
import styles from "./buyCreditsModal.module.css";

export type BuyCreditsModalProps = {
  open: boolean;
  onClose: () => void;
  onError?: (message: string) => void;
};

export default function BuyCreditsModal({
  open,
  onClose,
  onError,
}: BuyCreditsModalProps) {
  const tCredits = useTranslations("credits");
  const tCommon = useTranslations("common");
  const titleId = useId();
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [packsLoading, setPacksLoading] = useState(false);
  const [packsError, setPacksError] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (packs.length > 0 || packsLoading) return;
    setPacksLoading(true);
    setPacksError("");
    getCreditPacks()
      .then((rows) => {
        setPacks(rows);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load credit packs";
        setPacksError(message);
        onError?.(message);
      })
      .finally(() => {
        setPacksLoading(false);
      });
  }, [open, packs.length, packsLoading, onError]);

  const handleBuyNow = async (packId: string) => {
    setIsPurchasing(true);
    try {
      const { paymentUrl } = await purchaseCredits(packId);
      window.location.href = paymentUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : tCredits("buy");
      onError?.(message);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={isPurchasing ? undefined : onClose}>
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
      >
        <h3 className={styles.title} id={titleId}>
          {tCredits("insufficientTitle")}
        </h3>
        <p className={styles.desc}>{tCredits("buy")}</p>
        {packsLoading ? <p className={styles.meta}>{tCommon("loading")}...</p> : null}
        {packsError ? (
          <p className="mipoveGuestText mipoveGuestText--errorLight">{packsError}</p>
        ) : null}
        {!packsLoading && !packsError ? (
          <div className={styles.packsList}>
            {packs.map((pack) => (
              <article key={pack._id} className={styles.packCard}>
                <h4 className={styles.packName}>{pack.name}</h4>
                <p className={styles.packCredits}>
                  {pack.credits} + {pack.bonusCredits} {tCredits("balance")}
                </p>
                <p className={styles.packPrice}>₾{pack.priceGel}</p>
                <button
                  type="button"
                  className={styles.buyNowBtn}
                  onClick={() => void handleBuyNow(pack._id)}
                  disabled={isPurchasing}
                >
                  {tCredits("buyNow")}
                </button>
              </article>
            ))}
          </div>
        ) : null}
        <button type="button" className={styles.closeBtn} onClick={onClose} disabled={isPurchasing}>
          {tCommon("close")}
        </button>
      </div>
    </div>
  );
}
