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

type DummyOrder = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  priceRange: string;
  location: string;
  expectedBy: string;
  publisherName: string;
  publisherPhone: string;
  publisherEmail: string;
};

export default function OrderPage() {
  const t = useTranslations("order");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [expandedContactKey, setExpandedContactKey] = useState<string | null>(null);

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
            {(t.raw("dummyOrders") as DummyOrder[]).map((order, index) => {
              const cardKey = `${order.title}-${order.expectedBy}`;
              const contactPanelId = `order-contact-${index}`;
              const telHref = `tel:${order.publisherPhone.replace(/\s/g, "")}`;
              const contactOpen = expandedContactKey === cardKey;
              return (
                <article key={cardKey} className={styles.orderCard}>
                  <div className={styles.orderTop}>
                    <div className={styles.orderThumb}>
                      <Image
                        src={order.imageSrc}
                        alt={order.imageAlt}
                        width={88}
                        height={88}
                        className={styles.orderThumbImg}
                      />
                    </div>
                    <div className={styles.orderMain}>
                      <h3 className={styles.orderTitle}>{order.title}</h3>
                      <p className={styles.orderDescription}>{order.description}</p>
                    </div>
                    <dl className={styles.orderMeta}>
                      <div className={styles.orderMetaBlock}>
                        <dt className={styles.orderMetaLabel}>{t("metaPriceRange")}</dt>
                        <dd className={styles.orderMetaValue}>{order.priceRange}</dd>
                      </div>
                      <div className={styles.orderMetaBlock}>
                        <dt className={styles.orderMetaLabel}>{tCommon("location")}</dt>
                        <dd className={styles.orderMetaValue}>{order.location}</dd>
                      </div>
                      <div className={styles.orderMetaBlock}>
                        <dt className={styles.orderMetaLabel}>{t("metaExpectedBy")}</dt>
                        <dd className={styles.orderMetaValue}>{order.expectedBy}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className={styles.orderFooter}>
                    <button
                      type="button"
                      className={styles.contactInfoBtn}
                      aria-expanded={contactOpen}
                      aria-controls={contactPanelId}
                      onClick={() =>
                        setExpandedContactKey(contactOpen ? null : cardKey)
                      }
                    >
                      {contactOpen ? t("hideContactInformation") : t("seeContactInformation")}
                    </button>
                  </div>
                  {contactOpen ? (
                    <div className={styles.orderContactExtra} id={contactPanelId} role="region">
                      <div className={styles.contactExtraRow}>
                        <span className={styles.contactExtraLabel}>{tCommon("name")}</span>
                        <span className={styles.contactExtraValue}>{order.publisherName}</span>
                      </div>
                      <div className={styles.contactExtraRow}>
                        <span className={styles.contactExtraLabel}>{tCommon("phone")}</span>
                        <a href={telHref} className={styles.contactExtraLink}>
                          {order.publisherPhone}
                        </a>
                      </div>
                      <div className={styles.contactExtraRow}>
                        <span className={styles.contactExtraLabel}>{tCommon("email")}</span>
                        <a href={`mailto:${order.publisherEmail}`} className={styles.contactExtraLink}>
                          {order.publisherEmail}
                        </a>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
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
