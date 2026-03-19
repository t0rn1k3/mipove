"use client";

import Image from "next/image";
import { Phone, Mail, Star, Instagram } from "lucide-react";
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

            {master.specialty && (
              <div className={styles.specialtyBadge}>{master.specialty}</div>
            )}

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
            <div className={styles.contentInner}>
              <div>
                <h2 className={styles.name}>{master.name}</h2>
                <p className={styles.locationRow}>
                  <LocationIcon />
                  {master.location || "—"}
                </p>

                {hasRating && (
                  <div className={styles.ratingSection}>
                    <div className={styles.ratingStars}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.floor(master.rating!)
                              ? styles.starFilled
                              : styles.starEmpty
                          }
                        />
                      ))}
                    </div>
                    {master.reviewCount != null && master.reviewCount > 0 && (
                      <span className={styles.reviewCount}>
                        ({master.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </I18nLink>

        <div className={styles.contactRow}>
          {master.phone && (
            <motion.a
              href={`tel:${master.phone}`}
              className={styles.contactLink}
              title="Call"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Phone size={16} />
            </motion.a>
          )}
          {master.email && (
            <motion.a
              href={`mailto:${master.email}`}
              className={styles.contactLink}
              title="Email"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Mail size={16} />
            </motion.a>
          )}
          {master.instagram && (
            <motion.a
              href={`https://instagram.com/${master.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
              title="Instagram"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Instagram size={16} />
            </motion.a>
          )}
          <I18nLink href={`/profile/${master.slug}`} className={styles.viewBtn}>
            {t("viewPortfolio")}
          </I18nLink>
        </div>
      </div>
    </motion.div>
  );
}
