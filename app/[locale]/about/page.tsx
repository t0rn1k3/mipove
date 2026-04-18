"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Logo from "@/components/logo/Logo";
import styles from "./about.module.css";

function MissionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function VisionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ValuesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const DRIVE_SCROLL_DELAYS = [
  styles.scrollRevealDelay3,
  styles.scrollRevealDelay4,
  styles.scrollRevealDelay5,
  styles.scrollRevealDelay6,
] as const;

/** Stable ids + message keys under `about` in en.json / ka.json */
const DRIVE_CARDS: {
  id: string;
  titleKey: "ourMission" | "ourVision" | "ourCommunity" | "ourValues";
  textKey: "missionText" | "visionText" | "communityText" | "valuesText";
  Icon: ComponentType;
}[] = [
  { id: "mission", titleKey: "ourMission", textKey: "missionText", Icon: MissionIcon },
  { id: "vision", titleKey: "ourVision", textKey: "visionText", Icon: VisionIcon },
  { id: "community", titleKey: "ourCommunity", textKey: "communityText", Icon: CommunityIcon },
  { id: "values", titleKey: "ourValues", textKey: "valuesText", Icon: ValuesIcon },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible] as const;
}

export default function AboutPage() {
  const [storySectionRef, storySectionVisible] = useScrollReveal();
  const [drivesSectionRef, drivesSectionVisible] = useScrollReveal();
  const [joinSectionRef, joinSectionVisible] = useScrollReveal();
  const [footerSectionRef, footerSectionVisible] = useScrollReveal();
  const t = useTranslations("about");

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <Logo
          showText
          size={48}
          className={`${styles.heroLogo} ${styles.reveal} ${styles.revealDelay1}`}
        />
        <h1 className={`${styles.heroTitle} ${styles.reveal} ${styles.revealDelay2}`}>{t("title")}</h1>
      </section>

      <section ref={storySectionRef} className={styles.section}>
        <div
          className={`${styles.sectionInner} ${storySectionVisible ? styles.visible : ""}`}
        >
          <div
            className={`${styles.storyCard} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          >
            <h2 className={styles.storyTitle}>{t("ourStory")}</h2>
            <p className={styles.storyText}>{t("story1")}</p>
            <p className={styles.storyText}>{t("story2")}</p>
            <p className={styles.storyText}>{t("story3")}</p>
            <p className={styles.storyText}>{t("story4")}</p>
          </div>
        </div>
      </section>

      {/* What Drives Us */}
      {/* <section ref={drivesSectionRef} className={styles.section}>
        <div
          className={`${styles.sectionInner} ${drivesSectionVisible ? styles.visible : ""}`}
        >
          <h2
            className={`${styles.sectionTitle} ${styles.sectionTitleCenter} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          >
            {t("whatDrivesUs")}
          </h2>
          <p
            className={`${styles.sectionSubtitle} ${styles.sectionSubtitleCenter} ${styles.scrollReveal} ${styles.scrollRevealDelay2}`}
          >
            {t("drivesSubtitle")}
          </p>

          <div className={styles.drivesGrid}>
            {DRIVE_CARDS.map((item, i) => {
              const Icon = item.Icon;
              return (
                <div
                  key={item.id}
                  className={`${styles.driveCard} ${styles.scrollReveal} ${DRIVE_SCROLL_DELAYS[i]}`}
                >
                  <div className={styles.driveIcon}>
                    <Icon />
                  </div>
                  <h3 className={styles.driveTitle}>{t(item.titleKey)}</h3>
                  <p className={styles.driveText}>{t(item.textKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* Join Community */}
      <section ref={joinSectionRef} className={styles.joinSection}>
        <div className={joinSectionVisible ? styles.visible : ""}>
          <div
            className={`${styles.joinCard} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          >
            <h2 className={styles.joinTitle}>{t("joinCommunity")}</h2>
            <p className={styles.joinDescription}>{t("joinDesc")}</p>
            <div className={styles.joinButtons}>
              <Link href="/masters" className={styles.joinBtnPrimary}>
                {t("findProfessionals")}
              </Link>
              <Link href="/join" className={styles.joinBtnSecondary}>
                {t("becomeMember")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerSectionRef} className={styles.footer}>
        <div className={footerSectionVisible ? styles.visible : ""}>
          <Link
            href="/"
            className={`${styles.footerLogo} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          >
            <Logo showText size={24} />
          </Link>
          <p
            className={`${styles.footerCopyright} ${styles.scrollReveal} ${styles.scrollRevealDelay2}`}
          >
            {t("copyright")}
          </p>
          <p className={`${styles.footerMade} ${styles.scrollReveal} ${styles.scrollRevealDelay3}`}>
            {t("madeIn")}
          </p>
        </div>
      </footer>
    </main>
  );
}
