"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import { useTranslations } from "next-intl";
import styles from "./hero.module.css";

export default function Hero() {
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (skill.trim()) params.set("specialty", skill.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/masters${params.toString() ? `?${params}` : ""}`);
  };

  const popularSkills = [t("painting"), t("sculpture"), t("pottery"), t("woodwork")];

  const handlePopularClick = (item: string) => {
    setSkill(item);
  };

  return (
    <section className={styles.section}>
      <div className={styles.backgroundImage}></div>
      <div className={styles.backgroundOverlay}></div>
      <div className={styles.container}>
        {/* LEFT SIDE */}
        <div className={styles.leftSide}>
          <h1 className={`${styles.title} ${styles.reveal} ${styles.revealDelay1}`}>
            {t("title")}
          </h1>

          <p className={`${styles.description} ${styles.reveal} ${styles.revealDelay2}`}>
            {t("description")}
          </p>

          {/* Search Bar */}
          <form
            className={`${styles.searchBar} ${styles.reveal} ${styles.revealDelay3}`}
            onSubmit={handleSearch}
          >
            <div className={styles.searchBarSeparator}>
              <div className={styles.searchInput}>
                <Image
                  src="/icons/search.svg"
                  alt={tCommon("search")}
                  width={20}
                  height={20}
                />
                <input
                  type="text"
                  placeholder={t("searchBySkill")}
                  className={styles.searchBarInput}
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                />
              </div>
              <div className={styles.searchInput}>
                <Image
                  src="/icons/location.svg"
                  alt={tCommon("location")}
                  width={20}
                  height={20}
                />
                <div className={styles.heroLocationWrap}>
                  <CityAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder={t("locationPlaceholder")}
                    className={styles.heroCityAutocomplete}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className={styles.searchBarButton}>{t("searchButton")}</button>
          </form>

      
          
        </div>

        {/* RIGHT SIDE IMAGES */}
        <div className={styles.rightSide}>
          <div className={`${styles.mainImage} ${styles.reveal} ${styles.revealDelay5}`}>
            <Image
              src="/images/artisan-2.jpg"
              alt={t("heroMainAlt")}
              width={280}
              height={280}
            />
          </div>

          <div className={`${styles.secondaryImage} ${styles.reveal} ${styles.revealDelay6}`}>
            <Image
              src="/images/artisan-2.jpg"
              alt={t("heroSecondaryAlt")}
              width={280}
              height={280}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
