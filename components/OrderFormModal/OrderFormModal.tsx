"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
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

export default function OrderFormModal({ open, onClose, onSubmit }: OrderFormModalProps) {
  const tForm = useTranslations("orderForm");
  const tCommon = useTranslations("common");
  const [formKey, setFormKey] = useState(0);
  const prevOpen = useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setFormKey((k) => k + 1);
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      onClick={onClose}
    >
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
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
