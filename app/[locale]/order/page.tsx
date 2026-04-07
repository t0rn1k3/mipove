"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getMe,
  getImageUrl,
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  uploadFile,
  addMasterFavoriteOrder,
  removeMasterFavoriteOrder,
  getMasterFavoriteOrders,
  spendCredits,
  getUnlockedIds,
} from "@/lib/api";
import type { OrdersPageSessionUser, OrderRecord } from "@/lib/types";
import BuyCreditsModal from "@/components/BuyCreditsModal/BuyCreditsModal";
import { InsufficientCreditsError } from "@/lib/types";
import BackgroundImage from "@/components/BackgroundImage/backgroundImage";
import OrderFormModal from "@/components/OrderFormModal/OrderFormModal";
import OrdersSmartFilter, {
  FILTER_BUDGET_MAX,
  FILTER_LOCATION_VALUES,
  type OrderFilterState,
} from "@/components/OrdersSmartFilter/OrdersSmartFilter";
import { useCreditBalance } from "@/components/CreditBalanceContext/CreditBalanceContext";
import { Banknote, MapPin, CalendarClock, User, Phone, Heart, Lock, Loader2 } from "lucide-react";
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

function isImageAttachment(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(url);
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
  const tCredits = useTranslations("credits");
  const { setBalance: setCreditBalance } = useCreditBalance();
  const [sessionUser, setSessionUser] = useState<OrdersPageSessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [expandedContactKey, setExpandedContactKey] = useState<string | null>(null);
  const [unlockedContactIds, setUnlockedContactIds] = useState<Set<string>>(new Set());
  const [favoriteOrderIds, setFavoriteOrderIds] = useState<string[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
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
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError("");
    getOrders()
      .then((rows) => {
        if (cancelled) return;
        setOrders(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then(({ data }) => {
        if (cancelled) return;
        if (data.role === "admin") {
          setSessionUser({
            id: data._id,
            name: data.name,
            email: data.email,
            image: data.image,
            role: "admin",
          });
          return;
        }
        const nextUser: OrdersPageSessionUser = {
          id: data._id,
          name: data.name,
          email: data.email,
          image: data.image,
          role: data.role,
          slug: data.slug,
        };
        setSessionUser(nextUser);
        if (data.role === "master") {
          Promise.all([getMasterFavoriteOrders(), getUnlockedIds("view_contact")])
            .then(([favoriteRows, unlockedIds]) => {
              if (cancelled) return;
              setFavoriteOrderIds(favoriteRows.map((item) => item._id));
              setUnlockedContactIds(new Set(unlockedIds));
            })
            .catch(() => {});
        }
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
  const canCreateOrder = sessionUser?.role === "user";

  const avatarSrc = sessionUser
    ? (() => {
        const raw = sessionUser.image?.trim();
        if (raw && raw.length > 0) return getImageUrl(raw);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionUser.name)}&size=200`;
      })()
    : "";

  const filteredOrders = useMemo(() => {
    const query = debouncedSearch;
    return orders.filter((order) => {
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
  }, [debouncedSearch, filterState, orders]);

  const uploadAttachments = async (files: File[]) => {
    if (!files.length) return [] as string[];
    return Promise.all(files.map((file) => uploadFile(file)));
  };

  const handleCreateOrder = async (form: {
    title: string;
    category: string;
    description: string;
    location: string;
    budgetMin: number;
    budgetMax: number;
    priceNegotiable: boolean;
    deadline: string;
    images: File[];
  }) => {
    const title = form.title.trim();
    if (!title) throw new Error("Title is required");
    if (form.budgetMin < 0 || form.budgetMax < 0) throw new Error("Price must be zero or greater");

    const attachmentUrls = await uploadAttachments(form.images);
    const created = await createOrder({
      title,
      category: form.category,
      description: form.description.trim(),
      location: form.location,
      budgetMin: form.budgetMin,
      budgetMax: form.budgetMax,
      priceNegotiable: form.priceNegotiable,
      deadline: form.deadline,
      attachments: attachmentUrls,
    });
    setOrders((prev) => [created, ...prev]);
    setToast({ type: "success", message: t("orderCreated") });
  };

  const handleUpdateOrder = async (form: {
    title: string;
    category: string;
    description: string;
    location: string;
    budgetMin: number;
    budgetMax: number;
    priceNegotiable: boolean;
    deadline: string;
    images: File[];
  }) => {
    if (!editingOrder) return;
    const title = form.title.trim();
    if (!title) throw new Error("Title is required");
    if (form.budgetMin < 0 || form.budgetMax < 0) throw new Error("Price must be zero or greater");

    const attachmentUrls = await uploadAttachments(form.images);
    const updated = await updateOrder(editingOrder._id, {
      title,
      category: form.category,
      description: form.description.trim(),
      location: form.location,
      budgetMin: form.budgetMin,
      budgetMax: form.budgetMax,
      priceNegotiable: form.priceNegotiable,
      deadline: form.deadline,
      attachments: [...(editingOrder.attachments ?? []), ...attachmentUrls],
    });
    setOrders((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    setEditingOrder(null);
    setToast({ type: "success", message: t("orderUpdated") });
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = window.confirm(t("deleteOrderConfirm"));
    if (!confirmed) return;
    setBusyKey(`delete:${orderId}`);
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((item) => item._id !== orderId));
      setToast({ type: "success", message: t("orderDeleted") });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : t("deleteOrderFailed"),
      });
    } finally {
      setBusyKey(null);
    }
  };

  const handleToggleFavorite = async (orderId: string) => {
    if (sessionUser?.role !== "master") return;
    const active = favoriteOrderIds.includes(orderId);
    setBusyKey(`favorite:${orderId}`);
    try {
      if (active) {
        await removeMasterFavoriteOrder(orderId);
        setFavoriteOrderIds((prev) => prev.filter((id) => id !== orderId));
        setToast({ type: "success", message: t("favoriteRemoved") });
      } else {
        await addMasterFavoriteOrder(orderId);
        setFavoriteOrderIds((prev) => [...prev, orderId]);
        setToast({ type: "success", message: t("favoriteAdded") });
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : t("favoriteActionFailed"),
      });
    } finally {
      setBusyKey(null);
    }
  };

  const handleUnlockContact = async (orderId: string) => {
    if (sessionUser?.role !== "master") return;
    setBusyKey(`unlock:${orderId}`);
    try {
      const result = await spendCredits("view_contact", orderId);
      setUnlockedContactIds((prev) => {
        const next = new Set(prev);
        next.add(orderId);
        return next;
      });
      setCreditBalance(result.remaining);
      setExpandedContactKey(orderId);
      setToast({ type: "success", message: tCredits("contactUnlocked") });
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        setToast({
          type: "error",
          message: tCredits("insufficientDesc", {
            required: err.required,
            balance: err.balance,
          }),
        });
        setBuyCreditsOpen(true);
        return;
      }
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : t("favoriteActionFailed"),
      });
    } finally {
      setBusyKey(null);
    }
  };

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
            onClick={() => {
              if (!canCreateOrder) {
                setToast({ type: "error", message: t("loginRequired") });
                return;
              }
              setFormModalOpen(true);
            }}
            disabled={busyKey === "create"}
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
            {ordersLoading ? <p className={styles.noOrdersMatch}>{t("loadingOrders")}</p> : null}
            {!ordersLoading && ordersError ? <p className={styles.errorBanner}>{ordersError}</p> : null}
            {!ordersLoading && !ordersError ? filteredOrders.map((order, index) => {
              const cardKey = order._id;
              const contactPanelId = `order-contact-${index}`;
              const phone = order.publisher?.phone ?? "";
              const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : "";
              const isFavorite = favoriteOrderIds.includes(order._id);
              const isMaster = sessionUser?.role === "master";
              const isUnlockedForMaster = isMaster && unlockedContactIds.has(order._id);
              const contactOpen = isMaster ? isUnlockedForMaster : expandedContactKey === cardKey;
              const isOwner =
                sessionUser?.role === "user" &&
                Boolean(sessionUser.id) &&
                order.publisher?._id === sessionUser.id;
              const canEditPending = isOwner && order.status === "pending";
              const rawFirstImage = (order.attachments ?? []).find((url) => isImageAttachment(url));
              const firstImageSrc = rawFirstImage ? getImageUrl(rawFirstImage) : "";
              const attachments = order.attachments ?? [];
              const deleting = busyKey === `delete:${order._id}`;
              const favoriteBusy = busyKey === `favorite:${order._id}`;
              const unlockBusy = busyKey === `unlock:${order._id}`;
              return (
                <article
                  key={cardKey}
                  className={`${styles.orderCard} ${styles.scrollReveal} ${ORDER_CARD_DELAY[index % ORDER_CARD_DELAY.length]}`}
                >
                  <div className={styles.orderTop}>
                    <div className={styles.orderThumb}>
                      <Image
                        src={firstImageSrc || "/images/hero-main.jpg"}
                        alt={order.title}
                        width={88}
                        height={88}
                        className={styles.orderThumbImg}
                      />
                    </div>
                    <div className={styles.orderMain}>
                      <h3 className={styles.orderTitle}>{order.title}</h3>
                      <p className={styles.orderDescription}>{order.description}</p>
                      {attachments.length > 0 ? (
                        <div className={styles.attachmentsWrap}>
                          {attachments.slice(0, 4).map((url) => (
                            <a
                              key={url}
                              href={getImageUrl(url)}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.attachmentLink}
                            >
                              {isImageAttachment(url) ? t("attachmentImage") : t("attachmentFile")}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className={styles.orderMeta}>
                      <div
                        className={styles.orderMetaRow}
                        aria-label={`${t("metaPriceRange")}: ₾${order.budgetMin} - ₾${order.budgetMax}`}
                      >
                        <Banknote size={18} className={styles.orderMetaIcon} strokeWidth={2} aria-hidden />
                        <span className={styles.orderMetaValue}>
                          {order.priceNegotiable
                            ? t("filterNegotiableOnly")
                            : `₾${order.budgetMin.toLocaleString()} - ₾${order.budgetMax.toLocaleString()}`}
                        </span>
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
                        aria-label={`${t("metaExpectedBy")}: ${order.deadline}`}
                      >
                        <CalendarClock size={18} className={styles.orderMetaIcon} strokeWidth={2} aria-hidden />
                        <span className={styles.orderMetaValue}>{order.deadline}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.orderFooter}>
                    {isMaster ? (
                      <button
                        type="button"
                        className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ""}`}
                        onClick={() => handleToggleFavorite(order._id)}
                        aria-label={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
                        disabled={favoriteBusy}
                      >
                        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                    ) : null}
                    {canEditPending ? (
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => setEditingOrder(order)}
                        disabled={deleting}
                      >
                        {t("editOrder")}
                      </button>
                    ) : null}
                    {canEditPending ? (
                      <button
                        type="button"
                        className={styles.dangerBtn}
                        onClick={() => void handleDeleteOrder(order._id)}
                        disabled={deleting}
                      >
                        {deleting ? t("deletingOrder") : t("deleteOrder")}
                      </button>
                    ) : null}
                    {isMaster && !isUnlockedForMaster ? (
                      <button
                        type="button"
                        className={styles.contactInfoBtn}
                        onClick={() => void handleUnlockContact(order._id)}
                        disabled={unlockBusy}
                        aria-busy={unlockBusy}
                      >
                        <span className={styles.contactInfoBtnInner}>
                          {unlockBusy ? (
                            <Loader2 size={16} className={styles.contactInfoBtnIconSpin} strokeWidth={2} aria-hidden />
                          ) : (
                            <Lock size={16} strokeWidth={2} aria-hidden />
                          )}
                          <span>{unlockBusy ? tCredits("unlockContactLoading") : tCredits("unlockContact")}</span>
                        </span>
                      </button>
                    ) : null}
                    {!isMaster ? (
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
                    ) : null}
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
                            aria-label={`${tCommon("name")}: ${order.publisher?.name ?? "—"}`}
                          >
                            <User size={18} className={styles.contactExtraIcon} strokeWidth={2} aria-hidden />
                            <span className={styles.contactExtraValue}>{order.publisher?.name ?? "—"}</span>
                          </div>
                          {phone ? (
                            <div
                              className={styles.contactInlineGroup}
                              aria-label={`${tCommon("phone")}: ${phone}`}
                            >
                              <Phone size={18} className={styles.contactExtraIcon} strokeWidth={2} aria-hidden />
                              <a href={telHref} className={styles.contactExtraLink}>
                                {phone}
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }) : null}
            {!ordersLoading && !ordersError && filteredOrders.length === 0 ? (
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

      <OrderFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
      <OrderFormModal
        open={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        onSubmit={handleUpdateOrder}
        submitLabel={t("saveOrderChanges")}
        initialValues={
          editingOrder
            ? {
                title: editingOrder.title,
                category: editingOrder.category,
                description: editingOrder.description,
                location: editingOrder.location,
                budgetMin: editingOrder.budgetMin,
                budgetMax: editingOrder.budgetMax,
                priceNegotiable: editingOrder.priceNegotiable,
                deadline: (editingOrder.deadline as "urgent" | "week" | "month") ?? "",
                images: [],
              }
            : undefined
        }
      />
      {toast ? (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.message}
        </div>
      ) : null}
      <BuyCreditsModal
        open={buyCreditsOpen}
        onClose={() => setBuyCreditsOpen(false)}
        onError={(message) => {
          setToast({
            type: "error",
            message,
          });
        }}
      />
    </main>
  );
}
