"use client";

import Image from "next/image";
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
          <MapPin size={18} className={styles.icon} />
          <span>{location}</span>
        </div>
        <p className={styles.bio}>{bio}</p>

        <div className={styles.contacts}>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className={styles.contactLink}>
            <Phone size={18} className={styles.icon} />
            <span>{phone}</span>
          </a>
          <a href={`mailto:${email}`} className={styles.contactLink}>
            <Mail size={18} className={styles.icon} />
            <span>{email}</span>
          </a>
          {website && (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
            >
              <Globe size={18} className={styles.icon} />
              <span>{website}</span>
            </a>
          )}
          {instagram && (
            <a
              href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
            >
              <Instagram size={18} className={styles.icon} />
              <span>@{instagram}</span>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
