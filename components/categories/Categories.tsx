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
import { useTranslations } from "next-intl";

export default function Categories() {
  const t = useTranslations("categories");
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const CATEGORIES = [
    { title: t("woodworking"), count: 124, icon: Hammer },
    { title: t("metalwork"), count: 89, icon: Wrench },
    { title: t("potteryCeramics"), count: 156, icon: Flower2 },
    { title: t("textileFashion"), count: 98, icon: Shirt },
    { title: t("jewelryMaking"), count: 72, icon: Gem },
    { title: t("photography"), count: 145, icon: Camera },
    { title: t("paintingMurals"), count: 112, icon: Palette },
    { title: t("sculpture"), count: 67, icon: Mountain },
  ];

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
          {t("title")}
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
              <p className={styles.cardCount}>{cat.count} {t("professionals")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
