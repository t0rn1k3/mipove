"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { getImageUrl } from "@/lib/api";
import type { RatedMasterItem } from "@/lib/types";
import styles from "./ratedMastersList.module.css";

type RatedMastersListProps = {
  ratedMasters: RatedMasterItem[];
};

export default function RatedMastersList({ ratedMasters }: RatedMastersListProps) {
  const tProfile = useTranslations("profile");

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>{tProfile("ratedMasters")}</h2>
        <p className={styles.subtitle}>{tProfile("ratedMastersSubtitle")}</p>
      </div>

      {ratedMasters.length === 0 ? (
        <p className={styles.empty}>{tProfile("noRatedYet")}</p>
      ) : (
        <div className={styles.grid}>
          {ratedMasters.map((item) => (
            <Link
              key={item.master._id + item.ratedAt}
              href={`/profile/${item.master.slug}`}
              className={styles.card}
            >
              <div className={styles.imageWrap}>
                <Image
                  src={
                    getImageUrl(item.master.image) ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(item.master.name) +
                      "&size=200"
                  }
                  alt={item.master.name}
                  width={160}
                  height={160}
                  className={styles.image}
                />
                <div className={styles.stars}>
                  <Star size={16} fill="currentColor" />
                  <span>{item.stars}</span>
                </div>
              </div>
              <h3 className={styles.name}>{item.master.name}</h3>
              {item.master.specialty && (
                <p className={styles.specialty}>{item.master.specialty}</p>
              )}
              {item.master.location && (
                <div className={styles.location}>
                  <MapPin size={14} />
                  <span>{item.master.location}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
