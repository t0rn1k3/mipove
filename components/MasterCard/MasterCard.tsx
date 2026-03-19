"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { Link as I18nLink } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { getImageUrl } from "@/lib/api";
import type { MasterListItem } from "@/lib/types";
import styles from "./masterCard.module.css";

type MasterCardProps = {
  master: MasterListItem;
  delay?: number;
};

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

export default function MasterCard({ master, delay = 0 }: MasterCardProps) {
  const t = useTranslations("masters");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -8 }}
      className={styles.wrapper}
    >
      <div className={styles.card}>
        <I18nLink href={`/profile/${master.slug}`} className={styles.cardLink}>
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

            {master.projectsCount != null && master.projectsCount > 0 && (
              <div className={styles.projectsBadge}>
                {master.projectsCount} {t("projects")}
              </div>
            )}
          </div>

          <div className={styles.content}>
            <h2 className={styles.name}>{master.name}</h2>
            <p className={styles.specialty}>{master.specialty || "—"}</p>

            <div className={styles.ratingSection}>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => {
                  const filledCount = hasRating ? Math.floor(master.rating!) : 0;
                  return (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < filledCount ? styles.starFilled : styles.starEmpty
                      }
                    />
                  );
                })}
              </div>
              {master.reviewCount != null && master.reviewCount > 0 && (
                <span className={styles.reviewCount}>
                  ({master.reviewCount} {t("reviews")})
                </span>
              )}
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
        </I18nLink>

        <I18nLink href={`/profile/${master.slug}`} className={styles.viewBtn}>
          {t("viewProfile")}
        </I18nLink>
      </div>
    </motion.div>
  );
}
