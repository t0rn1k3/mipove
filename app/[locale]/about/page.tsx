"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/logo/Logo";
import styles from "./about.module.css";



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

  return { ref, isVisible };
}

export default function AboutPage() {
  const storySection = useScrollReveal();
  const drivesSection = useScrollReveal();
  const joinSection = useScrollReveal();
  const footerSection = useScrollReveal();

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <Logo
          showText
          size={48}
          className={`${styles.heroLogo} ${styles.reveal} ${styles.revealDelay1}`}
        />
        <h1
          className={`${styles.heroTitle} ${styles.reveal} ${styles.revealDelay2}`}
        >
          About Mipove
        </h1>
        <p
          className={`${styles.heroSubtitle} ${styles.reveal} ${styles.revealDelay3}`}
        >
          Where &quot;Find Me&quot; meets exceptional craftsmanship. Connecting
          you with Georgia&apos;s finest artisans and masters.
        </p>
      </section>

   
      <section ref={storySection.ref} className={styles.section}>
        <div
          className={`${styles.sectionInner} ${storySection.isVisible ? styles.visible : ""}`}
        >
          <div
            className={`${styles.storyCard} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          >
            <h2 className={styles.storyTitle}>Our Story</h2>
            <p className={styles.storyText}>
              In the heart of Georgia, where centuries of craftsmanship
              tradition meet modern innovation, mipove was born from a simple
              yet powerful idea: what if finding the perfect artisan or
              master was as easy as it should be?
            </p>
            <p className={styles.storyText}>
              We noticed that while Georgia is home to incredibly talented
              craftspeople—from master woodworkers and sculptors to innovative
              designers and skilled tradespeople—there was no elegant way for
              people to discover and connect with them. The process was
              fragmented, relying on word-of-mouth and chance encounters.
            </p>
            <p className={styles.storyText}>
              <strong>Mipove changes that.</strong> Our name, meaning &quot;find
              me&quot; in Georgian, embodies our mission: making exceptional
              talent visible, accessible, and connected to those who need it.
              We&apos;ve created a platform that celebrates the human element of
              craftsmanship while leveraging modern technology to make discovery
              effortless.
            </p>
            <p className={styles.storyText}>
              Today, mipove is more than a directory—it&apos;s a thriving
              community where professionals showcase their artistry, clients
              find trusted experts, and meaningful projects come to life through
              authentic connections.
            </p>
          </div>
        </div>
      </section>


      {/* What Drives Us */}
      <section ref={drivesSection.ref} className={styles.section}>
        <div
          className={`${styles.sectionInner} ${drivesSection.isVisible ? styles.visible : ""}`}
        >
          <h2
            className={`${styles.sectionTitle} ${styles.sectionTitleCenter} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          >
            What Drives Us
          </h2>
          <p
            className={`${styles.sectionSubtitle} ${styles.sectionSubtitleCenter} ${styles.scrollReveal} ${styles.scrollRevealDelay2}`}
          >
            The principles that guide everything we do
          </p>
          <div className={styles.drivesGrid}>
            {[
              {
                title: "Our Mission",
                text: "To bridge the gap between exceptional craftspeople and those who seek their expertise, creating meaningful connections that bring visions to life.",
                icon: MissionIcon,
              },
              {
                title: "Our Vision",
                text: "A world where finding the perfect professional is seamless, transparent, and inspiring—where quality craftsmanship is celebrated and accessible to all.",
                icon: VisionIcon,
              },
              {
                title: "Our Community",
                text: "Building a trusted network of verified artisans, craftspeople, and masters who share a commitment to excellence and authentic craftsmanship.",
                icon: CommunityIcon,
              },
              {
                title: "Our Values",
                text: "Authenticity, quality, transparency, and respect for the art of craftsmanship. We celebrate the human touch in an increasingly digital world.",
                icon: ValuesIcon,
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`${styles.driveCard} ${styles.scrollReveal} ${
                  [
                    styles.scrollRevealDelay3,
                    styles.scrollRevealDelay4,
                    styles.scrollRevealDelay5,
                    styles.scrollRevealDelay6,
                  ][i]
                }`}
              >
                <div className={styles.driveIcon}>
                  <item.icon />
                </div>
                <h3 className={styles.driveTitle}>{item.title}</h3>
                <p className={styles.driveText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     

      {/* Join Community */}
      <section ref={joinSection.ref} className={styles.joinSection}>
        <div className={joinSection.isVisible ? styles.visible : ""}>
          <div
            className={`${styles.joinCard} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          >
            <h2 className={styles.joinTitle}>Join Our Community</h2>
            <p className={styles.joinDescription}>
              Whether you&apos;re a craftsperson looking to showcase your work
              or someone seeking exceptional talent, mipove is your platform.
            </p>
            <div className={styles.joinButtons}>
              <Link href="/masters" className={styles.joinBtnPrimary}>
                Find Professionals
              </Link>
              <Link href="/join" className={styles.joinBtnSecondary}>
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerSection.ref} className={styles.footer}>
        <div className={footerSection.isVisible ? styles.visible : ""}>
          <Link
            href="/"
            className={`${styles.footerLogo} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          >
            <Logo showText size={24} />
          </Link>
          <p
            className={`${styles.footerCopyright} ${styles.scrollReveal} ${styles.scrollRevealDelay2}`}
          >
            © 2024 Mipove. All rights reserved.
          </p>
          <p
            className={`${styles.footerMade} ${styles.scrollReveal} ${styles.scrollRevealDelay3}`}
          >
            Made with ❤️ in Georgia.
          </p>
        </div>
      </footer>
    </main>
  );
}

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
