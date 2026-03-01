"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import styles from "./lightboxModal.module.css";

type LightboxModalProps = {
  image: string;
  title: string;
  description?: string;
  onClose: () => void;
};

export default function LightboxModal({
  image,
  title,
  description,
  onClose,
}: LightboxModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <div className={styles.imageWrapper}>
          <Image
            src={image}
            alt={title}
            fill
            className={styles.image}
            sizes="(max-width: 1024px) 100vw, 90vw"
          />
        </div>
        <div className={styles.caption}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
    </div>
  );
}
