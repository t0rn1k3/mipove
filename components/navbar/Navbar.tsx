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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Gallery", href: "/gallery" },
    { name: "Professionals", href: "/professionals" },
    { name: "About", href: "/about" },
  ];
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
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={styles.navLink}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <Link key="join" href="/join" className={styles.ctaButton}>
            Join Us
          </Link>
        </div>
      </div>
    </header>
  );
}
