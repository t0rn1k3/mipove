"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import { useTranslations } from "next-intl";
import { getProfessions } from "@/lib/api";
import { mapProfessionsToSelectOptions } from "@/lib/professions";
import type { Professions } from "@/lib/types";
import styles from "./hero.module.css";

export default function Hero() {
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");
  const tMasters = useTranslations("masters");
  const tProfessions = useTranslations("professions");
  const router = useRouter();
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [professionsRaw, setProfessionsRaw] = useState<Professions[]>([]);

  useEffect(() => {
    let cancelled = false;
    getProfessions()
      .then((list) => {
        if (!cancelled) setProfessionsRaw(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setProfessionsRaw([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const professionOptions = useMemo(
    () => mapProfessionsToSelectOptions(professionsRaw, tProfessions),
    [professionsRaw, tProfessions],
  );

  const specialtySelectOptions = useMemo(
    () => [{ value: "", label: tMasters("allSpecialties") }, ...professionOptions],
    [professionOptions, tMasters],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (specialty.trim()) params.set("specialty", specialty.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/masters${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className={styles.section}>
      <div className={styles.backgroundImage}></div>
      <div className={styles.backgroundOverlay}></div>
      <div className={styles.container}>
        {/* LEFT SIDE */}
        <div className={styles.leftSide}>
          <h1
            className={`${styles.title} ${styles.reveal} ${styles.revealDelay1}`}
          >
            {t("title")}
          </h1>

          <p
            className={`${styles.description} ${styles.reveal} ${styles.revealDelay2}`}
          >
            {t("description")}
          </p>

          {/* Search Bar */}
          <form
            className={`${styles.searchBar} ${styles.reveal} ${styles.revealDelay3}`}
            onSubmit={handleSearch}
          >
            {/* <div className={styles.searchBarSeparator}>
              <div className={styles.searchInput}>
                <Image
                  src="/icons/palette.svg"
                  alt={tCommon("specialty")}
                  width={20}
                  height={20}
                />
                <CustomSelect
                  id="hero-specialty"
                  options={specialtySelectOptions}
                  value={specialty}
                  onChange={setSpecialty}
                  placeholder={tMasters("allSpecialties")}
                  aria-label={tCommon("specialty")}
                  className={styles.heroSpecialtyWrap}
                  triggerClassName={styles.heroSpecialtyTrigger}
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

            <button type="submit" className={styles.searchBarButton}>
              {t("searchButton")}
            </button> */}
          </form>
        </div>

        {/* RIGHT SIDE IMAGES */}
        <div className={styles.rightSide}>
          <div
            className={`${styles.mainImage} ${styles.reveal} ${styles.revealDelay5}`}
          >
            <Image
              src="/images/master-3.jpg"
              alt={t("heroMainAlt")}
              width={280}
              height={280}
            />
          </div>

          <div
            className={`${styles.secondaryImage} ${styles.reveal} ${styles.revealDelay6}`}
          >
            <Image
              src="/images/master-1.jpg"
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
