"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./categories.module.css";
import {
  Hammer,
  Wrench,
  Flower2,
  Shirt,
  Gem,
  Camera,
  Palette,
  Mountain,
} from "lucide-react";

const CATEGORIES = [
  { title: "Woodworking", count: 124, icon: Hammer },
  { title: "Metalwork", count: 89, icon: Wrench },
  { title: "Pottery & Ceramics", count: 156, icon: Flower2 },
  { title: "Textile & Fashion", count: 98, icon: Shirt },
  { title: "Jewelry Making", count: 72, icon: Gem },
  { title: "Photography", count: 145, icon: Camera },
  { title: "Painting & Murals", count: 112, icon: Palette },
  { title: "Sculpture", count: 67, icon: Mountain },
];

export default function Categories() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ""}`}>
        <h2 className={`${styles.title} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}>
          Browse by Category
        </h2>
        <div className={styles.grid}>
          {CATEGORIES.map((cat, index) => (
            <div
              key={cat.title}
              className={`${styles.card} ${styles.scrollReveal} ${
                [
                  styles.scrollRevealDelay2, styles.scrollRevealDelay3,
                  styles.scrollRevealDelay4, styles.scrollRevealDelay5,
                  styles.scrollRevealDelay6, styles.scrollRevealDelay7,
                  styles.scrollRevealDelay8, styles.scrollRevealDelay9,
                ][index]
              }`}
            >
              <div className={styles.iconWrap}>
                <cat.icon className={styles.icon} />
              </div>
              <h3 className={styles.cardTitle}>{cat.title}</h3>
              <p className={styles.cardCount}>{cat.count} professionals</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
