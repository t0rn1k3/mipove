"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import OrderSubmissionForm, {
  type OrderFormState,
} from "@/components/OrderSubmissionForm/OrderSubmissionForm";
import styles from "./OrderFormModal.module.css";

export type OrderFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: OrderFormState) => void | Promise<void>;
};

const TITLE_ID = "order-form-modal-title";

/** Match `transition` on `.content` in CSS (exit unmount delay). */
const PANEL_TRANSITION_MS = 480;

export default function OrderFormModal({ open, onClose, onSubmit }: OrderFormModalProps) {
  const tForm = useTranslations("orderForm");
  const [formKey, setFormKey] = useState(0);
  const prevOpen = useRef(false);
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        setRendered(true);
        if (!prevOpen.current) {
          setFormKey((k) => k + 1);
        }
        prevOpen.current = true;
        raf2 = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2 !== 0) cancelAnimationFrame(raf2);
      };
    }

    prevOpen.current = false;
    let leaveTimer = 0;
    const exitRaf = requestAnimationFrame(() => {
      setEntered(false);
      leaveTimer = window.setTimeout(() => setRendered(false), PANEL_TRANSITION_MS);
    });
    return () => {
      cancelAnimationFrame(exitRaf);
      if (leaveTimer !== 0) window.clearTimeout(leaveTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!rendered) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [rendered, onClose]);

  if (!rendered) return null;

  return (
    <div
      className={`${styles.overlay} ${entered ? styles.overlayVisible : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      onClick={onClose}
    >
      <div
        className={`${styles.content} ${entered ? styles.contentVisible : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.heading}>
            <h2 id={TITLE_ID} className={styles.title}>
              {tForm("pageTitle")}
            </h2>
          </div>
         
        </div>
        <OrderSubmissionForm
          key={formKey}
          embedded
          onSubmit={async (data) => {
            await onSubmit?.(data);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
