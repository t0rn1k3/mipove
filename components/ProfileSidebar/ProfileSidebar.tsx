"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Globe, Instagram } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import styles from "./profileSidebar.module.css";

export type ProfileSidebarProps = {
  name: string;
  specialty: string;
  location: string;
  bio: string;
  phone: string;
  email: string;
  instagram?: string;
  website?: string;
  image: string;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onLogout?: () => void;
  onChangePhoto?: (file: File) => void;
  isUploadingPhoto?: boolean;
};

export default function ProfileSidebar({
  name,
  specialty,
  location,
  bio,
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
}: ProfileSidebarProps) {
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
        </div>
        {isOwnProfile && onChangePhoto && (
          <div className={styles.actions}>
            <label className={styles.actionBtn}>
              {isUploadingPhoto ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={isUploadingPhoto}
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  e.currentTarget.value = "";
                  if (file) onChangePhoto(file);
                }}
              />
            </label>
          </div>
        )}
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.specialty}>{specialty}</p>
        <div className={styles.location}>
          <MapPin size={18} className={styles.locationIcon} />
          <span>{location}</span>
        </div>
        <p className={styles.bio}>{bio}</p>

        <div className={styles.separator} />

        <div className={styles.contacts}>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className={styles.contactBlock}>
            <Phone size={20} className={styles.contactIcon} />
            <div className={styles.contactContent}>
              <span className={styles.contactLabel}>Phone</span>
              <span className={styles.contactDetail}>{phone}</span>
            </div>
          </a>
          <a href={`mailto:${email}`} className={styles.contactBlock}>
            <Mail size={20} className={styles.contactIcon} />
            <div className={styles.contactContent}>
              <span className={styles.contactLabel}>Email</span>
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

        <Link href={`mailto:${email}`} className={styles.ctaButton}>
          Get In Touch
        </Link>

        {isOwnProfile && (onEdit || onLogout) && (
          <div className={styles.actions}>
            {onEdit && (
              <button type="button" onClick={onEdit} className={styles.actionBtn}>
                Edit Profile
              </button>
            )}
            {onLogout && (
              <button type="button" onClick={onLogout} className={styles.logoutBtn}>
                Log out
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
