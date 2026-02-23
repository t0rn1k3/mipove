"use client";

import Link from "next/link";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.header}>
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
