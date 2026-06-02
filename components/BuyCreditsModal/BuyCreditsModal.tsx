"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import CreditsCheckoutFlow from "@/components/CreditsCheckoutFlow/CreditsCheckoutFlow";
import styles from "./buyCreditsModal.module.css";

export type BuyCreditsModalProps = {
  open: boolean;
  onClose: () => void;
  onError?: (message: string) => void;
  /** Default: blocked flow shows “Not enough credits”; voluntary purchase shows checkout title */
  intent?: "insufficientCredits" | "purchase";
};

export default function BuyCreditsModal({
  open,
  onClose,
  onError,
  intent = "insufficientCredits",
}: BuyCreditsModalProps) {
  const tCredits = useTranslations("credits");
  const tCommon = useTranslations("common");
  const titleId = useId();
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !checkoutBusy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, checkoutBusy]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={checkoutBusy ? undefined : onClose}>
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
      >
        <h3 className={styles.title} id={titleId}>
          {intent === "purchase"
            ? tCredits("checkout.pageTitle")
            : tCredits("insufficientTitle")}
        </h3>
        <CreditsCheckoutFlow
          layout="modal"
          onError={onError}
          onBusyChange={setCheckoutBusy}
        />
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          disabled={checkoutBusy}
        >
          {tCommon("close")}
        </button>
      </div>
    </div>
  );
}
