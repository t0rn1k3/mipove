"use client";

import Link from "next/link";
import styles from "./navbar.module.css";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={`${styles.header} ${isScrolled ? "bg-white/70 backdrop-blur-xs shadow-sm" : ""} `}
    >
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          Artisan<span className={styles.logoSpan}>Hub</span>
        </Link>

        <div className={styles.navContainer}>
          {/* Navigation */}
          <nav className={styles.navigation}>
            <Link href="/" className={styles.navLink}>
              Home
            </Link>
            <Link href="/gallery" className={styles.navLink}>
              Gallery
            </Link>
          </nav>

          {/* CTA Button */}
          <Link href="/join" className={styles.ctaButton}>
            Join Us
          </Link>
        </div>
      </div>
    </header>
  );
}
