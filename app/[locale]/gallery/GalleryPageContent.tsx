"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./galleryPage.module.css";
import Image from "next/image";
import BackgroundImage from "@/components/BackgroundImage/backgroundImage";

export default function GalleryPageContent() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  const WORKS = [
    {
      id: 1,
      title: "Ancient Vase",
      artist: "Luka M.",
      price: "$1,200",
      img: "/images/vase.jpg",
    },
    {
      id: 2,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 3,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 4,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 5,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 6,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 7,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 8,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 9,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
  ];
  return (
    <div ref={sectionRef} className={styles.container}>
      <BackgroundImage />
      <div className={isVisible ? styles.visible : ""}>
        <header className={styles.header}>
          <h1
            className={`${styles.title} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          >
            Discover Exquisite Works
          </h1>
          <div
            className={`${styles.filters} ${styles.scrollReveal} ${styles.scrollRevealDelay2}`}
          >
            {["All", "Painting", "Sculpture", "Pottery", "Jewelry"].map(
              (cat) => (
                <button key={cat} className={styles.filterBtn}>
                  {cat}
                </button>
              ),
            )}
          </div>
        </header>

        <div className={styles.grid}>
          {WORKS.map((work, index) => (
            <div
              key={work.id}
              className={`${styles.card} ${styles.scrollReveal} ${
                [
                  styles.scrollRevealDelay3,
                  styles.scrollRevealDelay4,
                  styles.scrollRevealDelay5,
                  styles.scrollRevealDelay6,
                  styles.scrollRevealDelay7,
                  styles.scrollRevealDelay8,
                  styles.scrollRevealDelay9,
                  styles.scrollRevealDelay10,
                  styles.scrollRevealDelay11,
                ][index]
              }`}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={work.img}
                  alt={work.title}
                  width={200}
                  height={200}
                />
              </div>
              <div className={styles.info}>
                <h3>{work.title}</h3>
                <p>{work.artist}</p>
                <span className={styles.price}>{work.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
