"use client";

import Link from "next/link";
import styles from "./navbar.module.css";
import Logo from "@/components/logo/Logo";
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
          <Logo showText size={35} />
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
