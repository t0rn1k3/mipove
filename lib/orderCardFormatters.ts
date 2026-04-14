import type { useTranslations } from "next-intl";
import type { OrderRecord } from "./types";

function formatDeadline(deadline: string, t: ReturnType<typeof useTranslations<"order">>) {
  if (deadline === "urgent") return t("filterDeadlineUrgent");
  if (deadline === "week") return t("filterDeadlineWeek");
  if (deadline === "month") return t("filterDeadlineMonth");
  return deadline;
}

export function formatScheduledLabel(
  raw: string | undefined,
  t: ReturnType<typeof useTranslations<"order">>,
): string {
  const value = String(raw ?? "").trim();
  if (!value) return "—";
  if (value === "urgent" || value === "week" || value === "month") {
    return formatDeadline(value, t);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export function formatBudgetLabel(
  order: OrderRecord,
  t: ReturnType<typeof useTranslations<"order">>,
): string {
  if (order.priceNegotiable) return t("filterNegotiableOnly");
  const minRaw = order.budget?.min ?? order.budgetMin;
  const maxRaw = order.budget?.max ?? order.budgetMax;
  const currency = order.budget?.currency || "GEL";
  const min = Number(minRaw);
  const max = Number(maxRaw);
  const hasMin = Number.isFinite(min) && min > 0;
  const hasMax = Number.isFinite(max) && max > 0;
  if (hasMin && hasMax) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  if (hasMin) return `${min.toLocaleString()} ${currency}`;
  if (hasMax) return `${max.toLocaleString()} ${currency}`;
  return `0 ${currency}`;
}

export function isImageAttachment(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(url);
}
