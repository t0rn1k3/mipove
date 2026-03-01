"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./howItWorks.module.css";
import { Search, ImageIcon, MessageCircle } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Browse categories or search directly for the perfect craftsperson for your project.",
  },
  {
    icon: ImageIcon,
    title: "Review Portfolios",
    description: "Explore work samples, read reviews, and find professionals who match your vision.",
  },
  {
    icon: MessageCircle,
    title: "Connect Directly",
    description: "Message professionals and start your project with confidence.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ""}`}>
        <h2 className={`${styles.title} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}>
          How It Works
        </h2>
        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`${styles.stepCard} ${styles.scrollReveal} ${
                [styles.scrollRevealDelay2, styles.scrollRevealDelay3, styles.scrollRevealDelay4][i]
              }`}
            >
              <div className={styles.badge}>{i + 1}</div>
              <div className={styles.iconWrap}>
                <step.icon className={styles.icon} />
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
