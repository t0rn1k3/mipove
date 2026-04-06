"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getMe, getImageUrl } from "@/lib/api";
import type { DummyOrder, OrdersPageSessionUser } from "@/lib/types";
import BackgroundImage from "@/components/BackgroundImage/backgroundImage";
import OrderFormModal from "@/components/OrderFormModal/OrderFormModal";
import OrdersSmartFilter, {
  FILTER_BUDGET_MAX,
  FILTER_LOCATION_VALUES,
  type OrderFilterState,
} from "@/components/OrdersSmartFilter/OrdersSmartFilter";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import { Banknote, MapPin, CalendarClock, User, Phone } from "lucide-react";
import styles from "./orderPage.module.css";

const ORDER_CARD_DELAY = [
  styles.scrollRevealDelay1,
  styles.scrollRevealDelay2,
  styles.scrollRevealDelay3,
  styles.scrollRevealDelay4,
  styles.scrollRevealDelay5,
  styles.scrollRevealDelay6,
] as const;

const INITIAL_FILTER_STATE: OrderFilterState = {
  search: "",
  categories: [],
  location: "",
  budgetMin: 0,
  budgetMax: FILTER_BUDGET_MAX,
  negotiableOnly: false,
  deadlines: [],
};

const LOCATION_ALIASES: Record<string, (typeof FILTER_LOCATION_VALUES)[number]> = {
  tbilisi: "tbilisi",
  თბილისი: "tbilisi",
  batumi: "batumi",
  ბათუმი: "batumi",
  kutaisi: "kutaisi",
  ქუთაისი: "kutaisi",
  rustavi: "rustavi",
  რუსთავი: "rustavi",
  zugdidi: "zugdidi",
  ზუგდიდი: "zugdidi",
  gori: "gori",
  გორი: "gori",
  poti: "poti",
  ფოთი: "poti",
  telavi: "telavi",
  თელავი: "telavi",
  akhaltsikhe: "akhaltsikhe",
  ახალციხე: "akhaltsikhe",
  mtskheta: "mtskheta",
  მცხეთა: "mtskheta",
  other: "other",
  სხვა: "other",
};

function normalizeLocation(raw: string): string {
  const key = raw.trim().toLowerCase();
  return LOCATION_ALIASES[key] ?? key;
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible] as const;
}

export default function OrderPage() {
  const t = useTranslations("order");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [sessionUser, setSessionUser] = useState<OrdersPageSessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [expandedContactKey, setExpandedContactKey] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [filterState, setFilterState] = useState<OrderFilterState>(INITIAL_FILTER_STATE);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toolbarRef, toolbarVisible] = useScrollReveal();
  const [layoutRef, layoutVisible] = useScrollReveal();
  const [ordersRef, ordersVisible] = useScrollReveal();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filterState.search.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [filterState.search]);

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

  const filteredOrders = useMemo(() => {
    const query = debouncedSearch;
    return MOCK_ORDERS.filter((order) => {
      if (query) {
        const haystack = `${order.title} ${order.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (filterState.categories.length > 0 && !filterState.categories.includes(order.category)) {
        return false;
      }

      if (filterState.location) {
        if (normalizeLocation(order.location) !== filterState.location) return false;
      }

      if (filterState.negotiableOnly && !order.priceNegotiable) return false;

      if (!order.priceNegotiable) {
        const overlaps =
          order.budgetMax >= filterState.budgetMin && order.budgetMin <= filterState.budgetMax;
        if (!overlaps) return false;
      }

      if (filterState.deadlines.length > 0 && !filterState.deadlines.includes(order.deadline)) {
        return false;
      }

      return true;
    });
  }, [debouncedSearch, filterState]);

  return (
    <main className={styles.page}>
      <BackgroundImage />
     

      <div
        ref={toolbarRef}
        className={`${styles.toolbarReveal} ${toolbarVisible ? styles.revealVisible : ""}`}
      >
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.addOrderBtn} ${styles.scrollReveal}`}
            onClick={() => setFormModalOpen(true)}
          >
            {t("addYourOrder")}
          </button>
        </div>
      </div>

      <div
        ref={layoutRef}
        className={layoutVisible ? styles.revealVisible : ""}
      >
        <div className={styles.layout}>
        <aside
          className={`${styles.panel} ${styles.filterColumn} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
          aria-label={t("smartFilter")}
        >
          <h2 className={styles.panelTitle}>{t("smartFilter")}</h2>
          <div className={styles.filterSlot}>
            <OrdersSmartFilter
              value={filterState}
              onChange={setFilterState}
              onClear={() => setFilterState(INITIAL_FILTER_STATE)}
            />
          </div>
        </aside>

        <section
          className={`${styles.panel} ${styles.ordersColumn} ${styles.scrollReveal} ${styles.scrollRevealDelay2}`}
          aria-labelledby="orders-heading"
        >
          <h2 id="orders-heading" className={styles.panelTitle}>
            {t("ordersList")}
          </h2>
          <div
            ref={ordersRef}
            className={`${styles.ordersBody} ${ordersVisible ? styles.revealVisible : ""}`}
          >
            {filteredOrders.map((order: DummyOrder, index) => {
              const cardKey = `${order.title}-${order.expectedBy}`;
              const contactPanelId = `order-contact-${index}`;
              const telHref = `tel:${order.publisherPhone.replace(/\s/g, "")}`;
              const contactOpen = expandedContactKey === cardKey;
              return (
                <article
                  key={cardKey}
                  className={`${styles.orderCard} ${styles.scrollReveal} ${ORDER_CARD_DELAY[index % ORDER_CARD_DELAY.length]}`}
                >
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
                    <div className={styles.orderMeta}>
                      <div
                        className={styles.orderMetaRow}
                        aria-label={`${t("metaPriceRange")}: ${order.priceRange}`}
                      >
                        <Banknote size={18} className={styles.orderMetaIcon} strokeWidth={2} aria-hidden />
                        <span className={styles.orderMetaValue}>{order.priceRange}</span>
                      </div>
                      <div
                        className={styles.orderMetaRow}
                        aria-label={`${tCommon("location")}: ${order.location}`}
                      >
                        <MapPin size={18} className={styles.orderMetaIcon} strokeWidth={2} aria-hidden />
                        <span className={styles.orderMetaValue}>{order.location}</span>
                      </div>
                      <div
                        className={styles.orderMetaRow}
                        aria-label={`${t("metaExpectedBy")}: ${order.expectedBy}`}
                      >
                        <CalendarClock size={18} className={styles.orderMetaIcon} strokeWidth={2} aria-hidden />
                        <span className={styles.orderMetaValue}>{order.expectedBy}</span>
                      </div>
                    </div>
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
                  <div
                    className={`${styles.contactReveal} ${contactOpen ? styles.contactRevealOpen : ""}`}
                  >
                    <div className={styles.contactRevealInner}>
                      <div
                        className={styles.orderContactExtra}
                        id={contactPanelId}
                        role="region"
                        aria-hidden={!contactOpen}
                        inert={contactOpen ? undefined : true}
                      >
                        <div className={styles.contactNamePhoneRow}>
                          <div
                            className={styles.contactInlineGroup}
                            aria-label={`${tCommon("name")}: ${order.publisherName}`}
                          >
                            <User size={18} className={styles.contactExtraIcon} strokeWidth={2} aria-hidden />
                            <span className={styles.contactExtraValue}>{order.publisherName}</span>
                          </div>
                          <div
                            className={styles.contactInlineGroup}
                            aria-label={`${tCommon("phone")}: ${order.publisherPhone}`}
                          >
                            <Phone size={18} className={styles.contactExtraIcon} strokeWidth={2} aria-hidden />
                            <a href={telHref} className={styles.contactExtraLink}>
                              {order.publisherPhone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {filteredOrders.length === 0 ? (
              <p className={styles.noOrdersMatch}>{t("noOrdersMatch")}</p>
            ) : null}
          </div>
        </section>

        <aside
          className={`${styles.asideCard} ${styles.scrollReveal} ${styles.scrollRevealDelay3}`}
          aria-label={t("viewProfile")}
        >
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
      </div>

      <OrderFormModal open={formModalOpen} onClose={() => setFormModalOpen(false)} />
    </main>
  );
}
