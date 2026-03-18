"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import styles from "./mastersPage.module.css";
import Image from "next/image";
import { getMasters, getImageUrl } from "@/lib/api";
import type { MasterListItem } from "@/lib/types";

export default function MastersPage() {
  const [masters, setMasters] = useState<MasterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMasters()
      .then((data) => setMasters(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load masters"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Masters Directory</h1>
        <p className={styles.description}>Find the best masters in your area</p>
        <div className={styles.loading}>
          <p>Loading masters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Masters Directory</h1>
        <p className={styles.description}>Find the best masters in your area</p>
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (masters.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Masters Directory</h1>
        <p className={styles.description}>Find the best masters in your area</p>
        <div className={styles.empty}>
          <p>No masters found yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Masters Directory</h1>
      <p className={styles.description}>
        Find the best masters in your area
      </p>
      <div className={styles.grid}>
        {masters.map((master) => (
          <Link
            key={master._id}
            href={`/profile/${master.slug}`}
            className={styles.card}
          >
            <div className={styles.imageContainer}>
              <Image
                src={
                  getImageUrl(master.image) ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(master.name)}&size=200`
                }
                width={300}
                height={190}
                alt={master.name}
                className={styles.artisanImage}
              />
            </div>

            <div className={styles.content}>
              <h2 className={styles.name}>{master.name}</h2>
              {master.specialty && (
                <p className={styles.specialty}>{master.specialty}</p>
              )}
              <div className={styles.location}>
                <MapPin size={18} className={styles.pin} />
                <span>{master.location || "—"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
