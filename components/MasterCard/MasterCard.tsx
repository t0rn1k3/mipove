"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { Link as I18nLink } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { getImageUrl } from "@/lib/api";
import { translateProfessionDisplay } from "@/lib/professions";
import type { MasterCardProps } from "@/lib/types";
import styles from "./masterCard.module.css";

function LocationIcon() {
  return (
    <svg className={styles.locationIcon} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function MasterCard({
  master,
  delay = 0,
  canRate = false,
  myRating = null,
  onRate,
}: MasterCardProps) {
  const t = useTranslations("masters");
  const tProfessions = useTranslations("professions");
  const imageUrl =
    getImageUrl(master.image) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(master.name)}&size=200`;

  const hasRating = master.rating != null && master.rating > 0;
  const skills = master.skills ?? [];
  const descriptionText = master.bio || master.description || "";
  const truncatedBio = descriptionText
    ? descriptionText.length > 80
      ? descriptionText.slice(0, 80) + "..."
      : descriptionText
    : "—";
  const [rateHover, setRateHover] = useState(0);
  const [rateSelected, setRateSelected] = useState(myRating ?? 0);
  const [rateSubmitting, setRateSubmitting] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);
  const [rateError, setRateError] = useState("");

  useEffect(() => {
    setRateSelected(myRating ?? 0);
    setRateError("");
    setRateSuccess(false);
  }, [myRating, master.slug]);

  const interactive = canRate && !!onRate;
  const averageStars = hasRating ? Math.floor(master.rating!) : 0;
  const displayStars = rateHover || rateSelected || averageStars;

  const handleRateClick = async (stars: number) => {
    if (!onRate || rateSubmitting) return;
    setRateSelected(stars);
    setRateError("");
    setRateSuccess(false);
    setRateSubmitting(true);
    try {
      await onRate(master.slug, stars);
      setRateSuccess(true);
    } catch (e) {
      setRateError(e instanceof Error ? e.message : t("ratingError"));
    } finally {
      setRateSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -8 }}
      className={styles.wrapper}
    >
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.imageContainer}>
            <div className={styles.imageWrapper}>
              <Image
                src={imageUrl}
                width={400}
                height={320}
                alt={master.name}
                className={styles.image}
              />
            </div>
            <div className={styles.gradientOverlay} aria-hidden />

            {hasRating && (
              <div className={styles.ratingBadge}>
                <Star size={14} className={styles.starFilled} />
                <span className={styles.ratingText}>
                  {master.rating!.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className={styles.content}>
            <h2 className={styles.name}>{master.name}</h2>
            <p className={styles.specialty}>
              {translateProfessionDisplay(master.specialty, tProfessions) ||
                "—"}
            </p>

            <div className={styles.ratingSection}>
              <div
                className={`${styles.ratingStars} ${interactive ? styles.ratingStarsInteractive : ""}`}
                role={interactive ? "group" : undefined}
                aria-label={interactive ? t("rateNow") : undefined}
                onMouseLeave={interactive ? () => setRateHover(0) : undefined}
              >
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = n <= displayStars;
                  if (interactive) {
                    return (
                      <button
                        key={n}
                        type="button"
                        className={`${styles.rateStarBtn} ${filled ? styles.rateStarBtnActive : ""}`}
                        onMouseEnter={() => setRateHover(n)}
                        onClick={() => void handleRateClick(n)}
                        disabled={rateSubmitting}
                        aria-label={t("starLabel", { n })}
                      >
                        <Star size={16} fill={filled ? "currentColor" : "none"} />
                      </button>
                    );
                  }
                  return (
                    <Star
                      key={n}
                      size={14}
                      className={filled ? styles.starFilled : styles.starEmpty}
                    />
                  );
                })}
              </div>
              <span className={styles.reviewCount}>
                ({master.reviewCount ?? 0} {t("reviews")})
              </span>
              {rateSuccess && <p className={styles.rateSuccess}>{t("ratingSaved")}</p>}
              {rateError && <p className={styles.rateError}>{rateError}</p>}
            </div>

            <p className={styles.locationRow}>
              <LocationIcon />
              {master.location || "—"}
            </p>

            {skills.length > 0 && (
              <div className={styles.skillTags}>
                {skills.slice(0, 3).map((skill) => (
                  <span key={skill} className={styles.skillTag}>
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <p className={styles.bio}>{truncatedBio}</p>
          </div>
        </div>

        <I18nLink href={`/profile/${master.slug}`} className={styles.viewBtn}>
          {t("viewProfile")}
        </I18nLink>
      </div>
    </motion.div>
  );
}
