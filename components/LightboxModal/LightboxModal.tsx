"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import styles from "./lightboxModal.module.css";

type LightboxModalBaseProps = {
  onClose: () => void;
};

type LightboxModalSingleProps = LightboxModalBaseProps & {
  image: string;
  title: string;
  description?: string;
};

type LightboxModalGalleryProps = LightboxModalBaseProps & {
  images: string[];
  index: number;
  onIndexChange: (nextIndex: number) => void;
  title?: string;
};

type LightboxModalProps = LightboxModalSingleProps | LightboxModalGalleryProps;

export default function LightboxModal({
  onClose,
  ...rest
}: LightboxModalProps) {
  const isGallery = "images" in rest;
  const image = isGallery ? rest.images[rest.index] : rest.image;
  const title = isGallery ? rest.title ?? "Portfolio" : rest.title;
  const description = isGallery ? undefined : rest.description;
  const canNavigate = isGallery && rest.images.length > 1;

  const goPrev = () => {
    if (!isGallery) return;
    const len = rest.images.length;
    rest.onIndexChange((rest.index - 1 + len) % len);
  };

  const goNext = () => {
    if (!isGallery) return;
    const len = rest.images.length;
    rest.onIndexChange((rest.index + 1) % len);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!canNavigate) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, canNavigate, isGallery, ...(isGallery ? [rest.index, rest.images.length] : [])]);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {isGallery && (
          <div className={styles.topBar}>
            <div className={styles.counter}>
              {rest.index + 1} / {rest.images.length}
            </div>
          </div>
        )}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <div className={styles.imageWrapper}>
          {canNavigate && (
            <>
              <button
                type="button"
                className={styles.navBtnLeft}
                onClick={goPrev}
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                className={styles.navBtnRight}
                onClick={goNext}
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
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
