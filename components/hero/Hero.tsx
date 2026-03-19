"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import styles from "./hero.module.css";

const POPULAR_SKILLS = ["Painting", "Sculpture", "Pottery", "Woodwork"];

export default function Hero() {
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
            Find Your Perfect Craftsperson
          </h1>

          <p className={`${styles.description} ${styles.reveal} ${styles.revealDelay2}`}>
            Connect with exceptional artisans, sculptors, painters, and
            craftspeople who bring vision to life.
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
                  alt="Search"
                  width={20}
                  height={20}
                />
                <input
                  type="text"
                  placeholder="Search by skill..."
                  className={styles.searchBarInput}
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                />
              </div>
              <div className={styles.searchInput}>
                <Image
                  src="/icons/location.svg"
                  alt="Location"
                  width={20}
                  height={20}
                />
                <div className={styles.heroLocationWrap}>
                  <CityAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder="Location..."
                    className={styles.heroCityAutocomplete}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className={styles.searchBarButton}>Search</button>
          </form>

          {/* Popular Tags */}
          <div className={`${styles.popularTags} ${styles.reveal} ${styles.revealDelay4}`}>
            <span className={styles.popularTagsTitle}>Popular:</span>

            {POPULAR_SKILLS.map((item) => (
              <button
                key={item}
                type="button"
                className={styles.popularTagsButton}
                onClick={() => handlePopularClick(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE IMAGES */}
        <div className={styles.rightSide}>
          <div className={`${styles.mainImage} ${styles.reveal} ${styles.revealDelay5}`}>
            <Image
              src="/images/artisan-2.jpg"
              alt="Hero Main"
              width={280}
              height={280}
            />
          </div>

          <div className={`${styles.secondaryImage} ${styles.reveal} ${styles.revealDelay6}`}>
            <Image
              src="/images/artisan-2.jpg"
              alt="Hero Secondary"
              width={280}
              height={280}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
