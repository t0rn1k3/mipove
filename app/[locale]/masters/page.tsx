"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import styles from "./mastersPage.module.css";
import { getMasters, getMe, rateMaster } from "@/lib/api";
import type { MasterListItem } from "@/lib/types";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
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

  const applyFilters = useCallback(
    async (params?: { location?: string; specialty?: string; search?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMasters(params);
        setMasters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoad"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

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
    setSpecialty(specialtyFromUrl);
    setLocation(locationFromUrl);
    setSearch(searchFromUrl);

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
  }, [searchParams, t]);

  const handleSearch = useCallback(() => {
    void applyFilters({
      location: location || undefined,
      specialty: specialty || undefined,
      search: search || undefined,
    });
  }, [applyFilters, location, specialty, search]);

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

  const specialtyOptions = useMemo(() => allSpecialties, [allSpecialties]);

  const filtersEl = (
    <form
      className={styles.filters}
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <div className={styles.filterField}>
        <label htmlFor="filter-specialty" className={styles.filterLabel}>{tCommon("specialty")}</label>
        <select
          id="filter-specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className={styles.filterInput}
        >
          <option value="">{t("allSpecialties")}</option>
          {specialtyOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterField}>
        <label htmlFor="filter-location" className={styles.filterLabel}>{tCommon("location")}</label>
        <CityAutocomplete
          id="filter-location"
          value={location}
          onChange={setLocation}
          onSelect={(selectedValue) => {
            setLocation(selectedValue);
            void applyFilters({
              location: selectedValue || undefined,
              specialty: specialty || undefined,
              search: search || undefined,
            });
          }}
          placeholder={t("filterByCity")}
        />
      </div>
      <div className={styles.filterField}>
        <label htmlFor="filter-search" className={styles.filterLabel}>{t("searchByName")}</label>
        <input
          id="filter-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchMastersPlaceholder")}
          className={styles.filterInput}
        />
      </div>
      <div className={styles.filterActions}>
        <button type="submit" className={styles.searchBtn} disabled={loading}>
          {loading ? t("searching") : t("searchButton")}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.description}>{t("description")}</p>
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
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.description}>{t("description")}</p>
        {filtersEl}
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.description}>
        {t("description")}
      </p>

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
