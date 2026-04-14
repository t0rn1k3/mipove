"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getMe,
  getImageUrl,
  getOrders,
  ORDERS_PAGE_SIZE,
  getOrderCategories,
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
import type { OrderCategoryOption, OrdersPageSessionUser, OrderRecord } from "@/lib/types";
import BuyCreditsModal from "@/components/BuyCreditsModal/BuyCreditsModal";
import { InsufficientCreditsError } from "@/lib/types";
import BackgroundImage from "@/components/BackgroundImage/backgroundImage";
import OrderFormModal from "@/components/OrderFormModal/OrderFormModal";
import OrderListCard from "@/components/OrderListCard/OrderListCard";
import OrdersSmartFilter, {
  FILTER_BUDGET_MAX,
  FILTER_LOCATION_VALUES,
  type OrderFilterState,
} from "@/components/OrdersSmartFilter/OrdersSmartFilter";
import { useCreditBalance } from "@/components/CreditBalanceContext/CreditBalanceContext";
import { mapOrderCategoriesWithLabels } from "@/lib/orderCategoryI18n";
import {
  mergeOrderCategoriesFromForm,
  mergeOrderMetaFromForm,
  mergeOrderPublisherFromForm,
} from "@/lib/mergeOrderFromForm";
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
  const full = raw.trim().toLowerCase();
  if (LOCATION_ALIASES[full]) return LOCATION_ALIASES[full];
  const city = full.split(",")[0].trim();
  return LOCATION_ALIASES[city] ?? city;
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


function useScrollRevealWhen(ready: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;
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
  }, [ready]);

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
  const [ordersHasMore, setOrdersHasMore] = useState(false);
  const [ordersNextOffset, setOrdersNextOffset] = useState(0);
  const [ordersLoadingMore, setOrdersLoadingMore] = useState(false);
  const [unlockedContactIds, setUnlockedContactIds] = useState<Set<string>>(new Set());
  /** Master-only: which order’s contact panel is expanded (unlock is separate). */
  const [expandedContactKey, setExpandedContactKey] = useState<string | null>(null);
  const [favoriteOrderIds, setFavoriteOrderIds] = useState<string[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [filterState, setFilterState] = useState<OrderFilterState>(INITIAL_FILTER_STATE);
  const [orderCategories, setOrderCategories] = useState<OrderCategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const pendingLocalOrderIdsRef = useRef<Set<string>>(new Set());
  const ordersRequestIdRef = useRef(0);

  const mergeFirstOrdersPage = useCallback((prev: OrderRecord[], rows: OrderRecord[]) => {
    const serverIds = new Set(rows.map((r) => r._id));
    for (const id of serverIds) pendingLocalOrderIdsRef.current.delete(id);
    const carry = prev.filter(
      (p) => Boolean(p._id) && pendingLocalOrderIdsRef.current.has(p._id) && !serverIds.has(p._id),
    );
    return [...carry, ...rows];
  }, []);

  const appendOrdersPage = useCallback((prev: OrderRecord[], rows: OrderRecord[]) => {
    const serverIds = new Set(rows.map((r) => r._id));
    for (const id of serverIds) pendingLocalOrderIdsRef.current.delete(id);
    const pending = prev.filter(
      (p) => Boolean(p._id) && pendingLocalOrderIdsRef.current.has(p._id),
    );
    const serverLoaded = prev.filter(
      (p) => !p._id || !pendingLocalOrderIdsRef.current.has(p._id),
    );
    const existingIds = new Set(serverLoaded.map((p) => p._id));
    const toAdd = rows.filter((r) => !existingIds.has(r._id));
    return [...pending, ...serverLoaded, ...toAdd];
  }, []);

  
  const canCreateOrder = Boolean(
    sessionUser &&
      !["master", "admin"].includes(String(sessionUser.role).toLowerCase()),
  );
  const [toolbarRef, toolbarVisible] = useScrollRevealWhen(canCreateOrder);
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
    setCategoriesLoading(true);
    setCategoriesError("");
    getOrderCategories()
      .then((rows) => {
        if (!cancelled) setOrderCategories(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setCategoriesError(err instanceof Error ? err.message : "Failed to load categories");
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ordersFetchCategoriesKey = useMemo(
    () => [...filterState.categories].sort().join("\0"),
    [filterState.categories],
  );

  useEffect(() => {
    if (sessionLoading) return;

    const requestId = ++ordersRequestIdRef.current;
    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError("");
    setOrdersLoadingMore(false);
    getOrders({
      mine: canCreateOrder,
      categories: filterState.categories.length > 0 ? filterState.categories : undefined,
      limit: ORDERS_PAGE_SIZE,
      offset: 0,
    })
      .then((page) => {
        if (cancelled || requestId !== ordersRequestIdRef.current) return;
        setOrders((prev) => mergeFirstOrdersPage(prev, page.orders));
        setOrdersHasMore(page.hasMore);
        setOrdersNextOffset(page.nextOffset);
      })
      .catch((err) => {
        if (cancelled || requestId !== ordersRequestIdRef.current) return;
        setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
      })
      .finally(() => {
        if (!cancelled && requestId === ordersRequestIdRef.current) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    sessionLoading,
    canCreateOrder,
    mergeFirstOrdersPage,
    ordersFetchCategoriesKey,
    filterState.categories,
  ]);

  const loadMoreOrders = useCallback(async () => {
    if (!ordersHasMore || ordersLoadingMore || ordersLoading) return;
    const requestId = ordersRequestIdRef.current;
    setOrdersLoadingMore(true);
    setOrdersError("");
    try {
      const page = await getOrders({
        mine: canCreateOrder,
        categories: filterState.categories.length > 0 ? filterState.categories : undefined,
        limit: ORDERS_PAGE_SIZE,
        offset: ordersNextOffset,
      });
      if (requestId !== ordersRequestIdRef.current) return;
      setOrders((prev) => appendOrdersPage(prev, page.orders));
      setOrdersHasMore(page.hasMore);
      setOrdersNextOffset(page.nextOffset);
    } catch (err) {
      if (requestId !== ordersRequestIdRef.current) return;
      setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      if (requestId === ordersRequestIdRef.current) setOrdersLoadingMore(false);
    }
  }, [
    appendOrdersPage,
    canCreateOrder,
    filterState.categories,
    ordersHasMore,
    ordersLoading,
    ordersLoadingMore,
    ordersNextOffset,
  ]);

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

  const orderCategoriesForUi = useMemo(
    () => mapOrderCategoriesWithLabels(orderCategories, t),
    [orderCategories, t],
  );

  const avatarSrc = sessionUser
    ? (() => {
        const raw = sessionUser.image?.trim();
        if (raw && raw.length > 0) return getImageUrl(raw);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionUser.name)}&size=200`;
      })()
    : "";

  const filteredOrders = useMemo(() => {
    const query = debouncedSearch;
    const isDefaultFilter =
      !query &&
      filterState.categories.length === 0 &&
      !filterState.location &&
      !filterState.negotiableOnly &&
      filterState.budgetMin === 0 &&
      filterState.budgetMax === FILTER_BUDGET_MAX;

    if (isDefaultFilter) return orders;

    return orders.filter((order) => {
      if (query) {
        const haystack = `${order.title} ${order.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (filterState.categories.length > 0) {
        const orderCats =
          order.categories.length > 0 ? order.categories : order.category ? [order.category] : [];
        const matches = filterState.categories.every((id) => orderCats.includes(id));
        if (!matches) return false;
      }

      if (filterState.location) {
        const rawLocation =
          order.locationData?.city || order.locationData?.addressText || order.location;
        if (normalizeLocation(String(rawLocation ?? "")) !== filterState.location) return false;
      }

      if (filterState.negotiableOnly && !order.priceNegotiable) return false;

      if (!order.priceNegotiable) {
        const lo = Number(order.budgetMin) || 0;
        const hi = Number(order.budgetMax) || 0;
        const overlaps = hi >= filterState.budgetMin && lo <= filterState.budgetMax;
        if (!overlaps) return false;
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
    categories: string[];
    description: string;
    contactName: string;
    contactPhone: string;
    locationCity: string;
    locationLat?: number;
    locationLng?: number;
    budgetMin: number;
    budgetMax: number;
    budgetCurrency: string;
    priceNegotiable: boolean;
    scheduledAt: string;
    images: File[];
  }) => {
    const title = form.title.trim();
    if (!title) throw new Error("Title is required");
    if (form.budgetMin < 0 || form.budgetMax < 0) throw new Error("Price must be zero or greater");

    const created = await createOrder({
      title,
      categories: form.categories.length > 0 ? form.categories : null,
      customerNameSnapshot: form.contactName.trim(),
      customerPhoneSnapshot: form.contactPhone.trim(),
      description: form.description.trim(),
      location: {
        city: form.locationCity || undefined,
        addressText: undefined,
        lat: typeof form.locationLat === "number" ? form.locationLat : undefined,
        lng: typeof form.locationLng === "number" ? form.locationLng : undefined,
      },
      budget: {
        min: form.budgetMin,
        max: form.budgetMax,
        currency: form.budgetCurrency || "GEL",
      },
      scheduledAt: form.scheduledAt || null,
      files: form.images,
    });
    const merged = mergeOrderMetaFromForm(
      mergeOrderPublisherFromForm(
        mergeOrderCategoriesFromForm(created, form.categories),
        form.contactName,
        form.contactPhone,
      ),
      {
        locationCity: form.locationCity,
        locationLat: form.locationLat,
        locationLng: form.locationLng,
        budgetMin: form.budgetMin,
        budgetMax: form.budgetMax,
        budgetCurrency: form.budgetCurrency,
        priceNegotiable: form.priceNegotiable,
        scheduledAt: form.scheduledAt,
      },
    );
    if (merged._id) pendingLocalOrderIdsRef.current.add(merged._id);
    setOrders((prev) => {
      const without = prev.filter((p) => p._id !== merged._id);
      return [merged, ...without];
    });
    setToast({ type: "success", message: t("orderCreated") });
  };

  const handleUpdateOrder = async (form: {
    title: string;
    categories: string[];
    description: string;
    contactName: string;
    contactPhone: string;
    locationCity: string;
    locationLat?: number;
    locationLng?: number;
    budgetMin: number;
    budgetMax: number;
    budgetCurrency: string;
    priceNegotiable: boolean;
    scheduledAt: string;
    images: File[];
  }) => {
    if (!editingOrder) return;
    const title = form.title.trim();
    if (!title) throw new Error("Title is required");
    if (form.budgetMin < 0 || form.budgetMax < 0) throw new Error("Price must be zero or greater");

    const attachmentUrls = await uploadAttachments(form.images);
    const updated = await updateOrder(editingOrder._id, {
      title,
      categories: form.categories.length > 0 ? form.categories : null,
      customerNameSnapshot: form.contactName.trim(),
      customerPhoneSnapshot: form.contactPhone.trim(),
      description: form.description.trim(),
      location: {
        city: form.locationCity || undefined,
        addressText: undefined,
        lat: typeof form.locationLat === "number" ? form.locationLat : undefined,
        lng: typeof form.locationLng === "number" ? form.locationLng : undefined,
      },
      budget: {
        min: form.budgetMin,
        max: form.budgetMax,
        currency: form.budgetCurrency || "GEL",
      },
      scheduledAt: form.scheduledAt || null,
      attachments: [...(editingOrder.attachments ?? []), ...attachmentUrls],
    });
    const mergedUpdate = mergeOrderMetaFromForm(
      mergeOrderPublisherFromForm(
        mergeOrderCategoriesFromForm(updated, form.categories),
        form.contactName,
        form.contactPhone,
      ),
      {
        locationCity: form.locationCity,
        locationLat: form.locationLat,
        locationLng: form.locationLng,
        budgetMin: form.budgetMin,
        budgetMax: form.budgetMax,
        budgetCurrency: form.budgetCurrency,
        priceNegotiable: form.priceNegotiable,
        scheduledAt: form.scheduledAt,
      },
    );
    setOrders((prev) => prev.map((item) => (item._id === mergedUpdate._id ? mergedUpdate : item)));
    setEditingOrder(null);
    setToast({ type: "success", message: t("orderUpdated") });
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = window.confirm(t("deleteOrderConfirm"));
    if (!confirmed) return;
    setBusyKey(`delete:${orderId}`);
    try {
      await deleteOrder(orderId);
      pendingLocalOrderIdsRef.current.delete(orderId);
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
     

      {canCreateOrder ? (
        <div
          ref={toolbarRef}
          className={`${styles.toolbarReveal} ${toolbarVisible ? styles.revealVisible : ""}`}
        >
          <div className={styles.toolbar}>
            <button
              type="button"
              className={`${styles.addOrderBtn} ${styles.scrollReveal}`}
              onClick={() => setFormModalOpen(true)}
              disabled={busyKey === "create"}
            >
              {t("addYourOrder")}
            </button>
          </div>
        </div>
      ) : null}

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
              categoryOptions={orderCategoriesForUi}
              categoriesLoading={categoriesLoading}
              categoriesError={categoriesError || undefined}
            />
          </div>
        </aside>

        <section
          className={`${styles.panel} ${styles.ordersColumn} ${styles.scrollReveal} ${styles.scrollRevealDelay2}`}
          aria-labelledby="orders-heading"
        >
          <h2 id="orders-heading" className={styles.panelTitle}>
            {canCreateOrder ? t("ordersList") : t("title")}
          </h2>
          <div
            ref={ordersRef}
            className={`${styles.ordersBody} ${ordersVisible ? styles.revealVisible : ""}`}
          >
            {ordersLoading ? <p className={styles.noOrdersMatch}>{t("loadingOrders")}</p> : null}
            {!ordersLoading && ordersError ? (
              <p className="mipoveGuestText mipoveGuestText--errorLight">{ordersError}</p>
            ) : null}
            {!ordersLoading && !ordersError
              ? filteredOrders.map((order, index) => {
                  const cardKey = order._id;
                  const categoryLabels = (order.categories ?? [])
                    .map((id) => orderCategoriesForUi.find((c) => c.id === id)?.label ?? id)
                    .filter(Boolean);
                  const isFavorite = favoriteOrderIds.includes(order._id);
                  const isMaster = sessionUser?.role === "master";
                  const isUnlockedForMaster = isMaster && unlockedContactIds.has(order._id);
                  const isOwner =
                    canCreateOrder &&
                    Boolean(sessionUser?.id) &&
                    (order.publisher?._id === sessionUser?.id ||
                      order.user?._id === sessionUser?.id);
                  const contactOpen =
                    isMaster && isUnlockedForMaster && expandedContactKey === cardKey;
                  const canEditPending = isOwner && order.status === "pending";
                  const deleting = busyKey === `delete:${order._id}`;
                  const favoriteBusy = busyKey === `favorite:${order._id}`;
                  const unlockBusy = busyKey === `unlock:${order._id}`;
                  return (
                    <OrderListCard
                      key={cardKey}
                      order={order}
                      index={index}
                      categoryLabels={categoryLabels}
                      cardShellClassName={`${styles.scrollReveal} ${ORDER_CARD_DELAY[index % ORDER_CARD_DELAY.length]}`}
                      t={t}
                      tCommon={tCommon}
                      tCredits={tCredits}
                      showFavorite={isMaster}
                      isFavorite={isFavorite}
                      favoriteBusy={favoriteBusy}
                      onToggleFavorite={() => void handleToggleFavorite(order._id)}
                      showContactActions={isMaster}
                      isUnlockedForMaster={isUnlockedForMaster}
                      unlockBusy={unlockBusy}
                      onUnlockContact={() => void handleUnlockContact(order._id)}
                      contactOpen={contactOpen}
                      onToggleContactReveal={() =>
                        setExpandedContactKey((prev) => (prev === cardKey ? null : cardKey))
                      }
                      canEditPending={canEditPending}
                      deleting={deleting}
                      onEdit={() => setEditingOrder(order)}
                      onDelete={() => void handleDeleteOrder(order._id)}
                    />
                  );
                })
              : null}
            {!ordersLoading && !ordersError && ordersHasMore ? (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => void loadMoreOrders()}
                  disabled={ordersLoadingMore}
                >
                  {ordersLoadingMore ? t("loadingMoreOrders") : t("showMoreOrders")}
                </button>
              </div>
            ) : null}
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
              <p className="mipoveGuestText mipoveGuestText--onDark">{t("loginRequired")}</p>
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
        categoryOptions={orderCategoriesForUi}
        initialValues={
          sessionUser && canCreateOrder
            ? { contactName: sessionUser.name ?? "", contactPhone: "" }
            : undefined
        }
      />
      <OrderFormModal
        open={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        onSubmit={handleUpdateOrder}
        submitLabel={t("saveOrderChanges")}
        categoryOptions={orderCategoriesForUi}
        initialValues={
          editingOrder
            ? {
                title: editingOrder.title,
                categories:
                  editingOrder.categories.length > 0
                    ? editingOrder.categories
                    : editingOrder.category
                      ? [editingOrder.category]
                      : [],
                description: editingOrder.description,
                contactName: editingOrder.publisher?.name ?? "",
                contactPhone: editingOrder.publisher?.phone ?? "",
                locationCity:
                  editingOrder.locationData?.city ??
                  editingOrder.locationData?.addressText ??
                  editingOrder.location ??
                  "",
                locationLat: editingOrder.locationData?.lat,
                locationLng: editingOrder.locationData?.lng,
                budgetMin: editingOrder.budgetMin,
                budgetMax: editingOrder.budgetMax,
                budgetCurrency: editingOrder.budget?.currency ?? "GEL",
                priceNegotiable: editingOrder.priceNegotiable,
                scheduledAt:
                  typeof editingOrder.scheduledAt === "string"
                    ? editingOrder.scheduledAt.slice(0, 10)
                    : "",
                images: [],
              }
            : undefined
        }
      />
      {toast ? (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === "error" ? (
            <p className="mipoveGuestText mipoveGuestText--errorLight mipoveGuestText--inToast">
              {toast.message}
            </p>
          ) : (
            toast.message
          )}
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
