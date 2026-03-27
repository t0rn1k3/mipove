"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link as I18nLink } from "@/i18n/navigation";
import styles from "./masterRatingSection.module.css";

type MasterRatingSectionProps = {
  isMasterProfile: boolean;
  rating?: number;
  reviewCount?: number;
  isOwnProfile: boolean;
  slug?: string;
  canVoteRole: boolean;
  userRole: string | null;
  rateInitialStars: number | null;
  rateHover: number;
  rateSelected: number;
  rateSubmitting: boolean;
  rateSuccess: boolean;
  rateError: string;
  onRateHover: (value: number) => void;
  onRateSelect: (value: number) => void;
  onRateSubmit: () => void;
};

export default function MasterRatingSection({
  isMasterProfile,
  rating,
  reviewCount,
  isOwnProfile,
  slug,
  canVoteRole,
  userRole,
  rateInitialStars,
  rateHover,
  rateSelected,
  rateSubmitting,
  rateSuccess,
  rateError,
  onRateHover,
  onRateSelect,
  onRateSubmit,
}: MasterRatingSectionProps) {
  const tProfile = useTranslations("profile");

  return (
    <>
      {isMasterProfile && (
        <div className={styles.masterRatingSummary}>
          <div className={styles.masterRatingStars} aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={18}
                className={
                  n <= Math.floor(rating ?? 0)
                    ? styles.masterRatingStarFilled
                    : styles.masterRatingStarEmpty
                }
              />
            ))}
          </div>
          <p className={styles.masterRatingText}>
            {Number((rating ?? 0)).toFixed(1)} ({reviewCount ?? 0} {tProfile("votes")})
          </p>
        </div>
      )}

      {!isOwnProfile && slug && slug !== "me" && (
        !canVoteRole ? (
          <div className={styles.ratePanel}>
            <h2 className={styles.rateTitle}>{tProfile("rateThisMaster")}</h2>
            <p className={styles.rateSignIn}>
              {userRole === null ? (
                <>
                  {tProfile("signInToRate")}{" "}
                  <I18nLink href="/join" className={styles.rateSignInLink}>
                    {tProfile("signInLink")}
                  </I18nLink>
                </>
              ) : (
                tProfile("ratingNotAllowed")
              )}
            </p>
          </div>
        ) : (
          <div className={styles.ratePanel}>
            <h2 className={styles.rateTitle}>{tProfile("rateThisMaster")}</h2>
            <p className={styles.rateSubtitle}>
              {rateInitialStars != null
                ? tProfile("updateRatingHint")
                : tProfile("yourRatingHint")}
            </p>
            <div
              className={styles.rateStarsRow}
              role="group"
              aria-label={tProfile("yourRating")}
              onMouseLeave={() => onRateHover(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const displayStars = rateHover || rateSelected;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.rateStarBtn} ${n <= displayStars ? styles.rateStarBtnActive : ""}`}
                    onMouseEnter={() => onRateHover(n)}
                    onClick={() => onRateSelect(n)}
                    aria-label={tProfile("starLabel", { n })}
                  >
                    <Star
                      size={28}
                      fill={n <= displayStars ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className={styles.rateSubmitBtn}
              disabled={rateSelected < 1 || rateSubmitting}
              onClick={() => void onRateSubmit()}
            >
              {rateSubmitting
                ? tProfile("saving")
                : rateInitialStars != null
                  ? tProfile("updateRating")
                  : tProfile("submitRating")}
            </button>
            {rateSuccess && (
              <p className={styles.rateSuccess}>{tProfile("ratingSaved")}</p>
            )}
            {rateError && <p className={styles.rateError}>{rateError}</p>}
          </div>
        )
      )}
    </>
  );
}
