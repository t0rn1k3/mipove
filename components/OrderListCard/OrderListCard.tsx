"use client";

import Image from "next/image";
import type { useTranslations } from "next-intl";
import { Banknote, MapPin, CalendarClock, User, Phone, Heart, Lock, Loader2 } from "lucide-react";
import Logo from "@/components/logo/Logo";
import { getImageUrl } from "@/lib/api";
import type { OrderRecord } from "@/lib/types";
import {
  formatBudgetLabel,
  formatScheduledLabel,
  isImageAttachment,
} from "@/lib/orderCardFormatters";
import styles from "./orderListCard.module.css";

export type OrderListCardProps = {
  order: OrderRecord;
  index: number;
  categoryLabels: string[];
  /** Extra classes on the root (e.g. order page scroll-reveal from parent module). */
  cardShellClassName?: string;
  t: ReturnType<typeof useTranslations<"order">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
  tCredits: ReturnType<typeof useTranslations<"credits">>;
  showFavorite?: boolean;
  isFavorite?: boolean;
  favoriteBusy?: boolean;
  onToggleFavorite?: () => void;
  showContactActions?: boolean;
  isUnlockedForMaster?: boolean;
  unlockBusy?: boolean;
  onUnlockContact?: () => void;
  contactOpen?: boolean;
  onToggleContactReveal?: () => void;
  canEditPending?: boolean;
  deleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function OrderListCard({
  order,
  index,
  categoryLabels,
  cardShellClassName = "",
  t,
  tCommon,
  tCredits,
  showFavorite = false,
  isFavorite = false,
  favoriteBusy = false,
  onToggleFavorite,
  showContactActions = false,
  isUnlockedForMaster = false,
  unlockBusy = false,
  onUnlockContact,
  contactOpen = false,
  onToggleContactReveal,
  canEditPending = false,
  deleting = false,
  onEdit,
  onDelete,
}: OrderListCardProps) {
  const contactPanelId = `order-contact-${index}`;
  const deadlineLabel = formatScheduledLabel(order.scheduledAt || order.deadline, t);
  const locationLabel =
    String(order.locationData?.city ?? order.locationData?.addressText ?? order.location ?? "").trim() ||
    "—";
  const budgetLabel = formatBudgetLabel(order, t);
  const customerName =
    String(
      order.customerNameSnapshot ??
        order.user?.name ??
        order.orderingMaster?.name ??
        order.publisher?.name ??
        "",
    ).trim() || "—";
  const customerPhone = String(
    order.customerPhoneSnapshot ??
      order.user?.phone ??
      order.orderingMaster?.phone ??
      order.publisher?.phone ??
      "",
  ).trim();
  const telHrefFinal = customerPhone ? `tel:${customerPhone.replace(/\s/g, "")}` : "";
  const attachments = order.attachments ?? [];
  const rawFirstImage = attachments.find((url) => isImageAttachment(url));
  const firstImageSrc = rawFirstImage ? getImageUrl(rawFirstImage) : "";

  return (
    <article className={[styles.orderCard, cardShellClassName].filter(Boolean).join(" ")}>
      <div className={styles.orderTop}>
        <div className={styles.orderThumb}>
          {firstImageSrc ? (
            <Image
              src={firstImageSrc}
              alt={order.title}
              width={88}
              height={88}
              className={styles.orderThumbImg}
            />
          ) : (
            <div className={styles.orderThumbPlaceholder} aria-hidden>
              <div className={styles.orderThumbLogoLoop}>
                <Logo size={34} showText={false} className={styles.orderThumbLogo} />
              </div>
            </div>
          )}
        </div>
        <div className={styles.orderMain}>
          <h3 className={styles.orderTitle}>{order.title}</h3>
          <p className={styles.orderDescription}>{order.description}</p>
          {categoryLabels.length > 0 ? (
            <div className={styles.attachmentsWrap}>
              {categoryLabels.map((label) => (
                <span key={label} className={styles.attachmentLink}>
                  {label}
                </span>
              ))}
            </div>
          ) : null}
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
          <div className={styles.orderMetaRow} aria-label={`${t("metaPriceRange")}: ${budgetLabel}`}>
            <Banknote size={18} className={styles.orderMetaIcon} strokeWidth={2} aria-hidden />
            <span className={styles.orderMetaValue}>{budgetLabel}</span>
          </div>
          <div className={styles.orderMetaRow} aria-label={`${tCommon("location")}: ${locationLabel}`}>
            <MapPin size={18} className={styles.orderMetaIcon} strokeWidth={2} aria-hidden />
            <span className={styles.orderMetaValue}>{locationLabel}</span>
          </div>
          <div className={styles.orderMetaRow} aria-label={`${t("metaExpectedBy")}: ${deadlineLabel}`}>
            <CalendarClock size={18} className={styles.orderMetaIcon} strokeWidth={2} aria-hidden />
            <span className={styles.orderMetaValue}>{deadlineLabel}</span>
          </div>
        </div>
      </div>
      <div className={styles.orderFooter}>
        {showFavorite ? (
          <button
            type="button"
            className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ""}`}
            onClick={() => onToggleFavorite?.()}
            aria-label={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
            disabled={favoriteBusy}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        ) : null}
        {canEditPending && onEdit ? (
          <button type="button" className={styles.secondaryBtn} onClick={onEdit} disabled={deleting}>
            {t("editOrder")}
          </button>
        ) : null}
        {canEditPending && onDelete ? (
          <button type="button" className={styles.dangerBtn} onClick={onDelete} disabled={deleting}>
            {deleting ? t("deletingOrder") : t("deleteOrder")}
          </button>
        ) : null}
        {showContactActions && !isUnlockedForMaster ? (
          <button
            type="button"
            className={styles.contactInfoBtn}
            onClick={() => void onUnlockContact?.()}
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
        {showContactActions && isUnlockedForMaster ? (
          <button
            type="button"
            className={styles.contactInfoBtn}
            aria-expanded={contactOpen}
            aria-controls={contactPanelId}
            onClick={() => onToggleContactReveal?.()}
          >
            {contactOpen ? t("hideContactInformation") : t("seeContactInformation")}
          </button>
        ) : null}
      </div>
      <div className={`${styles.contactReveal} ${contactOpen ? styles.contactRevealOpen : ""}`}>
        <div className={styles.contactRevealInner}>
          <div
            className={styles.orderContactExtra}
            id={contactPanelId}
            role="region"
            aria-hidden={!contactOpen}
            inert={contactOpen ? undefined : true}
          >
            <div className={styles.contactNamePhoneRow}>
              <div className={styles.contactInlineGroup} aria-label={`${tCommon("name")}: ${customerName}`}>
                <User size={18} className={styles.contactExtraIcon} strokeWidth={2} aria-hidden />
                <span className={styles.contactExtraValue}>{customerName}</span>
              </div>
              {customerPhone ? (
                <div className={styles.contactInlineGroup} aria-label={`${tCommon("phone")}: ${customerPhone}`}>
                  <Phone size={18} className={styles.contactExtraIcon} strokeWidth={2} aria-hidden />
                  <a href={telHrefFinal} className={styles.contactExtraLink}>
                    {customerPhone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
