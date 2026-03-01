"use client";

import Image from "next/image";
import styles from "./hero.module.css";

export default function Hero() {
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
          <div className={`${styles.searchBar} ${styles.reveal} ${styles.revealDelay3}`}>
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
                />
              </div>
              <div className={styles.searchInput}>
                <Image
                  src="/icons/location.svg"
                  alt="Location"
                  width={20}
                  height={20}
                />
                <input
                  type="text"
                  placeholder="Location..."
                  className={styles.searchBarInput}
                />
              </div>
            </div>

            <button className={styles.searchBarButton}>Search</button>
          </div>

          {/* Popular Tags */}
          <div className={`${styles.popularTags} ${styles.reveal} ${styles.revealDelay4}`}>
            <span className={styles.popularTagsTitle}>Popular:</span>

            {["Painting", "Sculpture", "Pottery", "Woodwork"].map((item) => (
              <button key={item} className={styles.popularTagsButton}>
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
