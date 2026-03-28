"use client";

import Image from "next/image";
import styles from "./portfolioSection.module.css";

type PortfolioSectionProps = {
  portfolioImages: string[];
  selectedPortfolioPreviews: string[];
  portfolioUploading: boolean;
  portfolioError: string;
  userRole: string | null;
  isOwnProfile: boolean;
  isVisible: boolean;
  onSelectPortfolioFiles: (files: FileList | null) => void;
  onClearSelectedPortfolio: () => void;
  onUploadPortfolio: () => void;
  onOpenPortfolio: (index: number) => void;
};

export default function PortfolioSection({
  portfolioImages,
  selectedPortfolioPreviews,
  portfolioUploading,
  portfolioError,
  userRole,
  isOwnProfile,
  isVisible,
  onSelectPortfolioFiles,
  onClearSelectedPortfolio,
  onUploadPortfolio,
  onOpenPortfolio,
}: PortfolioSectionProps) {
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

  return (
    <>
      <div className={`${styles.portfolioHeader} ${styles.scrollReveal} ${isVisible ? styles.visibleDelay1 : ""}`}>
        <h2 className={styles.portfolioTitle}>Portfolio</h2>
        {userRole === "master" && isOwnProfile && (
          <label className={styles.portfolioAddBtn}>
            {portfolioUploading ? "Uploading..." : "Add photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              className={styles.hiddenInput}
              disabled={portfolioUploading}
              onChange={(e) => {
                onSelectPortfolioFiles(e.currentTarget.files);
                e.currentTarget.value = "";
              }}
            />
          </label>
        )}
      </div>

      {selectedPortfolioPreviews.length > 0 && (
        <div className={styles.portfolioPending}>
          {portfolioError && <p className={styles.errorText}>{portfolioError}</p>}
          <p className={styles.portfolioPendingLabel}>
            Ready to upload ({selectedPortfolioPreviews.length})
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
              onClick={onClearSelectedPortfolio}
              disabled={portfolioUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={onUploadPortfolio}
              disabled={portfolioUploading}
            >
              {portfolioUploading ? "Uploading..." : "Upload photos"}
            </button>
          </div>
        </div>
      )}

      {portfolioImages.length > 0 && (
        <div className={styles.masonry}>
          {portfolioImages.map((src, index) => (
            <div
              key={src}
              className={`${styles.workCard} ${styles.scrollReveal} ${isVisible ? (delays[index] ?? styles.visibleDelay13) : ""}`}
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
                <Image
                  src={src}
                  alt="Portfolio image"
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
