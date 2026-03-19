"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import styles from "./mastersPage.module.css";
import Image from "next/image";
import { getMasters, getImageUrl } from "@/lib/api";
import type { MasterListItem } from "@/lib/types";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";

export default function MastersPage() {
  const searchParams = useSearchParams();
  const [masters, setMasters] = useState<MasterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [search, setSearch] = useState("");
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);

  const applyFilters = useCallback(
    async (params?: { location?: string; specialty?: string; search?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMasters(params);
        setMasters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load masters");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

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
        setError(err instanceof Error ? err.message : "Failed to load masters");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleSearch = useCallback(() => {
    void applyFilters({
      location: location || undefined,
      specialty: specialty || undefined,
      search: search || undefined,
    });
  }, [applyFilters, location, specialty, search]);

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
        <label htmlFor="filter-specialty" className={styles.filterLabel}>Specialty</label>
        <select
          id="filter-specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className={styles.filterInput}
        >
          <option value="">All specialties</option>
          {specialtyOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterField}>
        <label htmlFor="filter-location" className={styles.filterLabel}>Location</label>
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
          placeholder="Filter by city..."
        />
      </div>
      <div className={styles.filterField}>
        <label htmlFor="filter-search" className={styles.filterLabel}>Search by name</label>
        <input
          id="filter-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search masters..."
          className={styles.filterInput}
        />
      </div>
      <div className={styles.filterActions}>
        <button type="submit" className={styles.searchBtn} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Masters Directory</h1>
        <p className={styles.description}>Find the best masters in your area</p>
        {filtersEl}
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
        {filtersEl}
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
        {filtersEl}
        <div className={styles.empty}>
          <p>No masters found.</p>
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

      {filtersEl}

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
