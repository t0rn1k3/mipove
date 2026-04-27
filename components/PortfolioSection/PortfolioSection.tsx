"use client";

import Image from "next/image";
import { useEffect, useState, type MouseEvent } from "react";
import {
  deletePortfolioImages,
  fetchMyPortfolio,
  uploadPortfolioImages,
} from "@/lib/api";
import type { PortfolioSectionProps } from "@/lib/types";
import styles from "./portfolioSection.module.css";
import { useTranslations } from "next-intl";
import { Loader2, X } from "lucide-react";

export default function PortfolioSection({
  portfolioImages,
  onPortfolioImagesChange,
  userRole,
  isOwnProfile,
  onOpenPortfolio,
}: PortfolioSectionProps) {
  const [selectedPortfolioFiles, setSelectedPortfolioFiles] = useState<File[]>(
    [],
  );
  const [selectedPortfolioPreviews, setSelectedPortfolioPreviews] = useState<
    string[]
  >([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  useEffect(() => {
    const urls = selectedPortfolioPreviews;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [selectedPortfolioPreviews]);

  const delays = [
    styles.visibleDelay2,
    styles.visibleDelay3,
    styles.visibleDelay4,
    styles.visibleDelay5,
    styles.visibleDelay6,
    styles.visibleDelay7,
    styles.visibleDelay8,
    styles.visibleDelay9,
    styles.visibleDelay10,
    styles.visibleDelay11,
    styles.visibleDelay12,
    styles.visibleDelay13,
  ];

  const handleSelectPortfolioFiles = (files: FileList | null) => {
    setPortfolioError("");
    if (!files || files.length === 0) return;

    const currentCount = portfolioImages?.length ?? 0;
    const nextCount = currentCount + files.length;
    if (nextCount > 30) {
      setPortfolioError(
        tCommon("portfolioMaxImages", { currentCount }),
      );
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const arr = Array.from(files);
    for (const f of arr) {
      if (!allowedTypes.includes(f.type)) {
        setPortfolioError("Only JPG, PNG, or WebP images are allowed.");
        return;
      }
      if (f.size > 4 * 1024 * 1024) {
        setPortfolioError("Each image must be 4MB or smaller.");
        return;
      }
    }

    const previews = arr.map((f) => URL.createObjectURL(f));
    setSelectedPortfolioFiles(arr);
    setSelectedPortfolioPreviews(previews);
  };

  const clearSelectedPortfolio = () => {
    for (const url of selectedPortfolioPreviews) URL.revokeObjectURL(url);
    setSelectedPortfolioFiles([]);
    setSelectedPortfolioPreviews([]);
  };

  const handleUploadPortfolio = async () => {
    setPortfolioError("");
    if (selectedPortfolioFiles.length === 0) return;

    setPortfolioUploading(true);
    try {
      const list = await uploadPortfolioImages(selectedPortfolioFiles);
      onPortfolioImagesChange(list);
      clearSelectedPortfolio();
    } catch (err) {
      setPortfolioError(err instanceof Error ? err.message : "Upload failed");
      if (userRole === "master" && isOwnProfile) {
        try {
          const list = await fetchMyPortfolio();
          onPortfolioImagesChange(list);
        } catch {
          /* keep prior list */
        }
      }
    } finally {
      setPortfolioUploading(false);
    }
  };

  const handleDeletePortfolioImage = async (url: string, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPortfolioError("");
    setDeletingUrl(url);
    try {
      const list = await deletePortfolioImages({ url });
      onPortfolioImagesChange(list);
    } catch (err) {
      setPortfolioError(err instanceof Error ? err.message : "Delete failed");
      if (userRole === "master" && isOwnProfile) {
        try {
          const list = await fetchMyPortfolio();
          onPortfolioImagesChange(list);
        } catch {
          /* keep prior list */
        }
      }
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <>
      <div
        className={`${styles.portfolioHeader} ${styles.scrollReveal} ${styles.visibleDelay1}`}
      >
        <h2 className={styles.portfolioTitle}>{t("portfolio")}</h2>
        {userRole === "master" && isOwnProfile && (
          <label className={styles.portfolioAddBtn}>
            {portfolioUploading ? t("uploading") : t("addPhotos")}
            <input
              type="file"
              accept="image/*"
              multiple
              className={styles.hiddenInput}
              disabled={portfolioUploading}
              onChange={(e) => {
                handleSelectPortfolioFiles(e.currentTarget.files);
                e.currentTarget.value = "";
              }}
            />
          </label>
        )}
      </div>

      {selectedPortfolioPreviews.length > 0 && (
        <div className={styles.portfolioPending}>
          {portfolioError && (
            <p className="mipoveGuestText mipoveGuestText--errorLight">{portfolioError}</p>
          )}
          <p className={styles.portfolioPendingLabel}>
            {t("readyToUpload")} ({selectedPortfolioPreviews.length})
          </p>
          <div className={styles.portfolioGrid}>
            {selectedPortfolioPreviews.map((src) => (
              <div key={src} className={styles.portfolioThumb}>
                <Image
                  src={src}
                  alt="Selected portfolio"
                  width={160}
                  height={160}
                  className={styles.portfolioThumbImg}
                  unoptimized
                />
              </div>
            ))}
          </div>
          <div className={styles.portfolioActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={clearSelectedPortfolio}
              disabled={portfolioUploading}
            >
              {tCommon("cancel")}
            </button>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => void handleUploadPortfolio()}
              disabled={portfolioUploading}
            >
              {portfolioUploading ? t("uploading") : t("uploadPhotos")}
            </button>
          </div>
        </div>
      )}

      {portfolioImages.length > 0 && (
        <div className={styles.masonry}>
          {portfolioImages.map((src, index) => (
            <div
              key={src}
              className={`${styles.workCard} ${styles.scrollReveal} ${delays[index] ?? styles.visibleDelay13}`}
              role="button"
              tabIndex={0}
              onClick={() => onOpenPortfolio(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenPortfolio(index);
                }
              }}
            >
              <div className={styles.workImageWrapper}>
                {userRole === "master" && isOwnProfile ? (
                  <button
                    type="button"
                    className={styles.portfolioDeleteBtn}
                    aria-label={t("removePhoto")}
                    title={t("removePhoto")}
                    disabled={Boolean(deletingUrl) || portfolioUploading}
                    onClick={(e) => void handleDeletePortfolioImage(src, e)}
                  >
                    {deletingUrl === src ? (
                      <Loader2
                        size={16}
                        strokeWidth={2}
                        className={styles.portfolioDeleteSpinner}
                        aria-hidden
                      />
                    ) : (
                      <X size={16} strokeWidth={2} aria-hidden />
                    )}
                  </button>
                ) : null}
                <Image
                  src={src}
                  alt={t("portfolioImage")}
                  width={400}
                  height={500}
                  className={styles.workImage}
                />
                <div className={styles.workOverlay} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
