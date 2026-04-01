"use client";

import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import styles from "./navbar.module.css";
import Logo from "@/components/logo/Logo";
import LocaleSwitcher from "@/components/LocaleSwitcher/LocaleSwitcher";
import { useState, useEffect } from "react";
import { getMe } from "@/lib/api";
import { useTranslations } from "next-intl";
import type { NavbarUserInfo } from "@/lib/types";

/** Stable across locale-only URL changes (avoids header remount + entrance animation). */
function routeKeyFromPathname(pathname: string | undefined): string {
  const raw = pathname ?? "/";
  const stripped = raw.replace(/^\/(en|ka)(\/|$)/, "$2") || "/";
  return stripped === "" ? "/" : stripped;
}

export default function Navbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<NavbarUserInfo>(null);
  const pathname = usePathname();
  const routeKey = routeKeyFromPathname(pathname);
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      getMe()
        .then(({ data }) => {
          if (cancelled) return;
          setIsAdmin(data.role === "admin");
          if (data.role !== "admin") {
            setUser({ name: data.name, image: data.image });
          } else {
            setUser(null);
          }
        })
        .catch(() => {
          if (cancelled) return;
          setIsAdmin(false);
          setUser(null);
        });
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [routeKey]);

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

  if (isAdminRoute) return null;

  const navLinks = [
    { name: t("home"), href: "/" },
    { name: t("gallery"), href: "/gallery" },
    { name: t("masters"), href: "/masters" },
    { name: t("orders"), href: "/order" },
    { name: t("about"), href: "/about" },
  ];
  return (
    <header
      key={routeKey}
      className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
    >
      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.visible : ""}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logoContainer}>
          <Logo showText size={35} />
        </Link>

        <button
          type="button"
          className={`${styles.hamburger} ${isMenuOpen ? styles.open : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? tCommon("closeMenu") : tCommon("openMenu")}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>

        <div className={`${styles.navContainer} ${isMenuOpen ? styles.open : ""}`}>
          {/* Navigation */}
          <nav className={styles.navigation}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`${styles.navLink} ${routeKey === link.href ? styles.navLinkActive : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <LocaleSwitcher />
          {isAdmin ? (
            <Link
              href="/admin"
              className={styles.ctaButton}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("admin")}
            </Link>
          ) : user ? (
            <Link
                href="/profile"
              className={styles.profileLink}
              onClick={() => setIsMenuOpen(false)}
            >
              {user.image ? (
                <div className={styles.profileAvatar}>
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={36}
                    height={36}
                    className={styles.profileAvatarImg}
                    unoptimized
                  />
                </div>
              ) : (
                <div className={styles.profileAvatarPlaceholder}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={styles.profileName}>{user.name}</span>
            </Link>
          ) : (
            <Link
                href="/join"
                className={styles.ctaButton}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("joinUs")}
              </Link>
          )}
        </div>
      </div>
    </header>
  );
}
