"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
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
  onRateSubmit: (stars: number) => Promise<void>;
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
  onRateSubmit,
}: MasterRatingSectionProps) {
  const tProfile = useTranslations("profile");
  const [rateHover, setRateHover] = useState(0);
  const [rateSelected, setRateSelected] = useState(0);
  const [rateSubmitting, setRateSubmitting] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);
  const [rateError, setRateError] = useState("");

  useEffect(() => {
    setRateSuccess((s) => (s ? false : s));
  }, [slug]);

  useEffect(() => {
    const target = rateInitialStars ?? 0;
    setRateSelected((s) => (s !== target ? target : s));
    setRateError((e) => (e !== "" ? "" : e));
  }, [rateInitialStars, slug]);

  const handleRateSelect = (stars: number) => {
    setRateSelected(stars);
    setRateSuccess(false);
  };

  const handleRateSubmit = async () => {
    if (!slug || slug === "me" || rateSelected < 1 || rateSubmitting) return;
    setRateError("");
    setRateSuccess(false);
    setRateSubmitting(true);
    try {
      await onRateSubmit(rateSelected);
      setRateSuccess(true);
    } catch (e) {
      setRateError(e instanceof Error ? e.message : tProfile("ratingError"));
    } finally {
      setRateSubmitting(false);
    }
  };

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
              onMouseLeave={() => setRateHover(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const displayStars = rateHover || rateSelected;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.rateStarBtn} ${n <= displayStars ? styles.rateStarBtnActive : ""}`}
                    onMouseEnter={() => setRateHover(n)}
                    onClick={() => handleRateSelect(n)}
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
              onClick={() => void handleRateSubmit()}
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
