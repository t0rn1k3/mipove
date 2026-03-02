"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Globe, Instagram } from "lucide-react";
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
}: ProfileSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div className={styles.avatarWrapper}>
          <Image
            src={image}
            alt={name}
            width={200}
            height={200}
            className={styles.avatar}
          />
        </div>
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

        {isOwnProfile && (
          <div className={styles.actions}>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className={styles.actionBtn}
              >
                Edit Profile
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className={styles.logoutBtn}
              >
                Log out
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
