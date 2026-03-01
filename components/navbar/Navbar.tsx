"use client";

import Link from "next/link";
import styles from "./navbar.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
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
      key={pathname}
      className={`${styles.header} ${isScrolled ? "bg-white/70 backdrop-blur-xs shadow-sm" : ""} `}
    >
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logoContainer}>
          <div className={styles.logo}>
            <svg
              width="35px"
              height="35px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className={styles.searchCircle}
                cx="10.5"
                cy="10.5"
                r="7.5"
                stroke="#59979b"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="10.5"
                cy="10.5"
                r="2"
                fill="black"
                className={styles.middleDot}
              />
              <path
                d="M15.7955 15.8111L21 21"
                stroke="#59979b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoSpan}>
              mi<span className={styles.logoSpanHighlight}>po</span>ve
            </span>
          </div>
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

          <Link key="join" href="/join" className={styles.ctaButton}>
            Join Us
          </Link>
        </div>
      </div>
    </header>
  );
}
