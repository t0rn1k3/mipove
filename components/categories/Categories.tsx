"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./categories.module.css";
import Image from "next/image";

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

  const items = [
    {
      title: "Painting",
      description: "Expert painters bringing visions to canvas",
    },
    {
      title: "Sculpture",
      description: "Master sculptors crafting timeless pieces",
    },
    {
      title: "Textiles",
      description: "Skilled artisans weaving tradition",
    },
    {
      title: "Restoration",
      description: "Preserving art with precision",
    },
  ];

  return (
    <section ref={sectionRef} className={styles.container}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ""}`}>
        {/* Heading */}
        <h2 className={`${styles.title} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}>
          Discover Craftsmanship
        </h2>
        <p className={`${styles.description} ${styles.scrollReveal} ${styles.scrollRevealDelay2}`}>
          Connect with skilled artisans across various disciplines
        </p>

        {/* Cards */}
        <div className={styles.cards}>
          {items.map((item, index) => (
            <div
              key={item.title}
              className={`${styles.card} ${styles.scrollReveal} ${
                [styles.scrollRevealDelay3, styles.scrollRevealDelay4, styles.scrollRevealDelay5, styles.scrollRevealDelay6][index]
              }`}
            >
              <div className={styles.cardIcon}>
                {/* Placeholder icon circle */}
                <Image
                  src="/icons/palette.svg"
                  alt="card icon"
                  width={30}
                  height={30}
                />
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>

              <p className={styles.cardDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
