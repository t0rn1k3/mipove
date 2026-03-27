"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import styles from "./mastersPage.module.css";
import { getMasters, getMe, rateMaster } from "@/lib/api";
import type { MasterListItem } from "@/lib/types";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import MasterCard from "@/components/MasterCard/MasterCard";

export default function MastersPage() {
  const t = useTranslations("masters");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const [masters, setMasters] = useState<MasterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [search, setSearch] = useState("");
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [viewerMasterSlug, setViewerMasterSlug] = useState<string | null>(null);
  const [myRatingsBySlug, setMyRatingsBySlug] = useState<Record<string, number>>({});
  const [isFiltersReady, setIsFiltersReady] = useState(false);
  const skipNextDebounce = useRef(true);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then(({ data }) => {
        if (cancelled) return;
        setViewerRole(data.role ?? null);
        setViewerMasterSlug(data.slug ?? null);
        const rated = data.ratedMasters ?? [];
        const map: Record<string, number> = {};
        for (const item of rated) {
          if (item.master?.slug) map[item.master.slug] = item.stars;
        }
        setMyRatingsBySlug(map);
      })
      .catch(() => {
        if (cancelled) return;
        setViewerRole(null);
        setViewerMasterSlug(null);
        setMyRatingsBySlug({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const specialtyFromUrl = searchParams.get("specialty") ?? "";
    const locationFromUrl = searchParams.get("location") ?? "";
    const searchFromUrl = searchParams.get("search") ?? "";
    if (specialtyFromUrl !== specialty) setSpecialty(specialtyFromUrl);
    if (locationFromUrl !== location) setLocation(locationFromUrl);
    if (searchFromUrl !== search) setSearch(searchFromUrl);

    let cancelled = false;
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const params =
          specialtyFromUrl || locationFromUrl || searchFromUrl
            ? {
                specialty: specialtyFromUrl || undefined,
                location: locationFromUrl || undefined,
                search: searchFromUrl || undefined,
              }
            : undefined;
        const data = await getMasters(params);
        if (cancelled) return;
        setMasters(data);
        const specialties = Array.from(
          new Set(
            data
              .map((m) => (m.specialty ?? "").trim())
              .filter((s) => s.length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b));
        setAllSpecialties(specialties);
        skipNextDebounce.current = true;
        setIsFiltersReady(true);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : t("failedToLoad"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, t]);

  useEffect(() => {
    if (!isFiltersReady) return;
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void getMasters({
        location: location || undefined,
        specialty: specialty || undefined,
        search: search || undefined,
      })
        .then((data) => {
          setMasters(data);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : t("failedToLoad"));
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [isFiltersReady, location, specialty, search, t]);

  const handleRateMaster = useCallback(
    async (masterSlug: string, stars: number) => {
      const prevStars = myRatingsBySlug[masterSlug] ?? null;
      const response = await rateMaster(masterSlug, stars);
      setMyRatingsBySlug((prev) => {
        const next = { ...prev };
        if (response.data?.ratedMasters?.length) {
          for (const item of response.data.ratedMasters) {
            if (item.master?.slug) next[item.master.slug] = item.stars;
          }
          return next;
        }
        next[masterSlug] = stars;
        return next;
      });

      setMasters((prev) =>
        prev.map((m) => {
          if (m.slug !== masterSlug) return m;
          const backendRating = response?.data?.rating;
          const backendReviewCount = response?.data?.reviewCount;
          if (backendRating != null || backendReviewCount != null) {
            return {
              ...m,
              rating: backendRating ?? m.rating,
              reviewCount: backendReviewCount ?? m.reviewCount,
            };
          }

          const oldCount = m.reviewCount ?? 0;
          const oldAverage = m.rating ?? 0;
          if (prevStars == null) {
            const newCount = oldCount + 1;
            const newAverage = ((oldAverage * oldCount) + stars) / newCount;
            return { ...m, rating: newAverage, reviewCount: newCount };
          }
          if (oldCount <= 0) return { ...m, rating: stars, reviewCount: 1 };
          const newAverage = ((oldAverage * oldCount) - prevStars + stars) / oldCount;
          return { ...m, rating: newAverage, reviewCount: oldCount };
        }),
      );
    },
    [myRatingsBySlug],
  );

  const specialtySelectOptions = useMemo(
    () => [
      { value: "", label: t("allSpecialties") },
      ...allSpecialties.map((s) => ({ value: s, label: s })),
    ],
    [allSpecialties, t],
  );

  const filtersEl = (
    <div className={styles.filters}>
      <div className={styles.filterField}>
        <div className={styles.filterInputWrap}>
          <Image
            src="/icons/search.svg"
            alt={tCommon("search")}
            width={20}
            height={20}
            className={styles.filterIcon}
          />
          <input
            id="filter-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchMastersPlaceholder")}
            className={styles.filterInput}
            aria-label={t("searchByName")}
          />
        </div>
      </div>
      <div className={styles.filterField}>
        <div className={styles.filterInputWrap}>
          <Image
            src="/icons/location.svg"
            alt={tCommon("location")}
            width={20}
            height={20}
            className={styles.filterIcon}
          />
          <CityAutocomplete
            id="filter-location"
            value={location}
            onChange={setLocation}
            onSelect={(v) => setLocation(v)}
            placeholder={t("filterByCity")}
            className={styles.filterInput}
          />
        </div>
      </div>

      <div className={styles.filterField}>
        <div className={styles.filterInputWrap}>
          <Image
            src="/icons/palette.svg"
            alt={tCommon("specialty")}
            width={20}
            height={20}
            className={styles.filterIcon}
          />
          <CustomSelect
            id="filter-specialty"
            options={specialtySelectOptions}
            value={specialty}
            onChange={setSpecialty}
            placeholder={t("allSpecialties")}
            aria-label={tCommon("specialty")}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.container}>
        {filtersEl}
        <div className={styles.loading}>
          <p>{t("loadingMasters")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        {filtersEl}
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {filtersEl}

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.grid}>
            {masters.map((master, index) => (
              <MasterCard
                key={master._id}
                master={master}
                delay={index * 0.1}
                canRate={
                  (viewerRole === "user" || viewerRole === "master") &&
                  !(viewerRole === "master" && viewerMasterSlug === master.slug)
                }
                myRating={myRatingsBySlug[master.slug] ?? null}
                onRate={handleRateMaster}
              />
            ))}
          </div>

          {masters.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.emptyState}
            >
              <p className={styles.emptyStateText}>{t("noMastersFound")}</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
