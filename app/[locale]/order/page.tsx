"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getMe, getImageUrl } from "@/lib/api";
import styles from "./orderPage.module.css";

type SessionUser = {
  name: string;
  email: string;
  image?: string;
  role: string;
  slug?: string;
};

export default function OrderPage() {
  const t = useTranslations("order");
  const tNav = useTranslations("nav");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then(({ data }) => {
        if (cancelled) return;
        if (data.role === "admin") {
          setSessionUser({
            name: data.name,
            email: data.email,
            image: data.image,
            role: "admin",
          });
          return;
        }
        setSessionUser({
          name: data.name,
          email: data.email,
          image: data.image,
          role: data.role,
          slug: data.slug,
        });
      })
      .catch(() => {
        if (!cancelled) setSessionUser(null);
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const profileHref =
    sessionUser?.role === "admin"
      ? "/admin"
      : sessionUser?.role === "master" && sessionUser.slug
        ? `/profile/${sessionUser.slug}`
        : "/profile/me";

  const roleLabel =
    sessionUser?.role === "admin"
      ? tNav("admin")
      : sessionUser?.role === "master"
        ? t("roleMaster")
        : t("roleClient");

  const avatarSrc = sessionUser
    ? (() => {
        const raw = sessionUser.image?.trim();
        if (raw && raw.length > 0) return getImageUrl(raw);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionUser.name)}&size=200`;
      })()
    : "";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("description")}</p>
      </header>

      <div className={styles.layout}>
        <aside className={`${styles.panel} ${styles.filterColumn}`} aria-label={t("smartFilter")}>
          <h2 className={styles.panelTitle}>{t("smartFilter")}</h2>
          <div className={styles.filterSlot} />
        </aside>

        <section className={`${styles.panel} ${styles.ordersColumn}`} aria-labelledby="orders-heading">
          <h2 id="orders-heading" className={styles.panelTitle}>
            {t("ordersList")}
          </h2>
          <div className={styles.ordersBody}>
            <p className={styles.emptyOrders}>{t("noOrders")}</p>
          </div>
        </section>

        <aside className={styles.asideCard} aria-label={t("viewProfile")}>
          {sessionLoading ? (
            <p className={styles.asideLoading}>{t("loadingProfile")}</p>
          ) : sessionUser ? (
            <>
              <div className={styles.avatarWrap}>
                <Image
                  src={avatarSrc}
                  alt={sessionUser.name}
                  width={96}
                  height={96}
                  className={styles.avatar}
                  unoptimized={avatarSrc.includes("ui-avatars.com")}
                />
              </div>
              <h3 className={styles.asideName}>{sessionUser.name}</h3>
              <p className={styles.asideRole}>{roleLabel}</p>
              <p className={styles.asideEmail}>{sessionUser.email}</p>
              <Link href={profileHref} className={styles.asideBtnOutline}>
                {sessionUser.role === "admin" ? t("adminPanel") : t("viewProfile")}
              </Link>
            </>
          ) : (
            <>
              <p className={styles.guestText}>{t("loginRequired")}</p>
              <Link href="/join" className={styles.asideBtnPrimary}>
                {tNav("joinUs")}
              </Link>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
