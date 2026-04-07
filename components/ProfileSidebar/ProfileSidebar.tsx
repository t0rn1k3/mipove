"use client";

import Image from "next/image";
import { MapPin, Phone, Mail, Globe, Instagram } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { useTranslations } from "next-intl";
import { translateProfessionDisplay } from "@/lib/professions";
import { Link } from "@/i18n/navigation";
import type { ProfileSidebarProps } from "@/lib/types";
import styles from "./profileSidebar.module.css";

export default function ProfileSidebar({
  name,
  specialty,
  location,
  bio,
  rating,
  reviewCount,
  credits,
  phone,
  email,
  instagram,
  website,
  image,
  isOwnProfile,
  onEdit,
  onLogout,
  onChangePhoto,
  isUploadingPhoto,
  onBuyCredits,
}: ProfileSidebarProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tCredits = useTranslations("credits");
  const tProfessions = useTranslations("professions");
  const resolvedImage = typeof image === "string" ? getImageUrl(image.trim()) : "";
  const avatarSrc =
    resolvedImage.length > 0
      ? resolvedImage
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400`;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div className={styles.avatarWrapper}>
          <Image
            src={avatarSrc}
            alt={name}
            width={200}
            height={200}
            className={styles.avatar}
          />
          {isOwnProfile && onChangePhoto && (
            <label
              className={styles.addPhotoBtn}
            aria-label={isUploadingPhoto ? t("uploadingPhoto") : t("changePhoto")}
            title={isUploadingPhoto ? t("uploading") : t("changePhoto")}
            >
              <span className={styles.addPhotoBtnIcon}>+</span>
              <input
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                disabled={isUploadingPhoto}
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  e.currentTarget.value = "";
                  if (file) onChangePhoto(file);
                }}
              />
            </label>
          )}
        </div>
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.specialty}>
          {translateProfessionDisplay(specialty, tProfessions) || specialty}
        </p>
        <div className={styles.location}>
          <MapPin size={18} className={styles.locationIcon} />
          <span>{location}</span>
        </div>
        {(typeof rating === "number" || typeof credits === "number" || onBuyCredits) && (
          <div className={styles.quickStats}>
            {typeof rating === "number" && (
              <div className={styles.statPill}>
                <span className={styles.statLabel}>Rating</span>
                <span className={styles.statValue}>
                  {rating.toFixed(1)}{typeof reviewCount === "number" ? ` (${reviewCount})` : ""}
                </span>
              </div>
            )}
            {typeof credits === "number" ? (
              <div className={styles.creditWrap}>
                <div className={styles.creditCard}>
                  <span className={styles.creditLabel}>Available credits</span>
                  <strong className={styles.creditValue}>{credits}</strong>
                </div>
                {onBuyCredits ? (
                  <div className={styles.creditActions}>
                    <button type="button" className={styles.buyCreditsBtn} onClick={onBuyCredits}>
                      {tCredits("buy")}
                    </button>
                    <Link href="/credits" className={styles.historyLinkBtn}>
                      {tCredits("history")}
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : onBuyCredits ? (
              <div className={styles.creditActions}>
                <button type="button" className={styles.buyCreditsBtn} onClick={onBuyCredits}>
                  {tCredits("buy")}
                </button>
                <Link href="/credits" className={styles.historyLinkBtn}>
                  {tCredits("history")}
                </Link>
              </div>
            ) : null}
          </div>
        )}
        <p className={styles.bio}>{bio}</p>

        <div className={styles.separator} />

        <div className={styles.contacts}>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className={styles.contactBlock}>
            <Phone size={20} className={styles.contactIcon} />
            <div className={styles.contactContent}>
              <span className={styles.contactLabel}>{tCommon("phone")}</span>
              <span className={styles.contactDetail}>{phone}</span>
            </div>
          </a>
          <a href={`mailto:${email}`} className={styles.contactBlock}>
            <Mail size={20} className={styles.contactIcon} />
            <div className={styles.contactContent}>
              <span className={styles.contactLabel}>{tCommon("email")}</span>
              <span className={styles.contactDetail}>{email}</span>
            </div>
          </a>
          {instagram && (
            <a
              href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactBlock}
            >
              <Instagram size={20} className={styles.contactIcon} />
              <div className={styles.contactContent}>
                <span className={styles.contactLabel}>Instagram</span>
                <span className={styles.contactDetail}>@{instagram}</span>
              </div>
            </a>
          )}
          {website && (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactBlock}
            >
              <Globe size={20} className={styles.contactIcon} />
              <div className={styles.contactContent}>
                <span className={styles.contactLabel}>Website</span>
                <span className={styles.contactDetail}>{website}</span>
              </div>
            </a>
          )}
        </div>

        {isOwnProfile && (onEdit || onLogout) && (
          <div className={styles.actions}>
            {onEdit && (
              <button type="button" onClick={onEdit} className={styles.actionBtn}>
                {t("editProfile")}
              </button>
            )}
            {onLogout && (
              <button type="button" onClick={onLogout} className={styles.logoutBtn}>
                {t("logOut")}
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
