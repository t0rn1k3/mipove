"use client";

import { type CSSProperties, useId } from "react";
import { MapPin, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import type { OrderCategoryOption } from "@/lib/types";
import styles from "./ordersSmartFilter.module.css";

export const FILTER_BUDGET_MAX = 5000;

export const FILTER_LOCATION_VALUES = [
  "tbilisi",
  "batumi",
  "kutaisi",
  "rustavi",
  "zugdidi",
  "gori",
  "poti",
  "telavi",
  "akhaltsikhe",
  "mtskheta",
  "other",
] as const;

export type OrderFilterState = {
  search: string;
  categories: string[];
  location: string;
  budgetMin: number;
  budgetMax: number;
  negotiableOnly: boolean;
};

type OrdersSmartFilterProps = {
  value: OrderFilterState;
  onChange: (next: OrderFilterState) => void;
  onClear: () => void;
  /** From GET /orders/categories */
  categoryOptions: OrderCategoryOption[];
  categoriesLoading?: boolean;
  categoriesError?: string;
};

export default function OrdersSmartFilter({
  value,
  onChange,
  onClear,
  categoryOptions,
  categoriesLoading = false,
  categoriesError,
}: OrdersSmartFilterProps) {
  const t = useTranslations("order");
  const tCommon = useTranslations("common");
  const locationFieldId = useId();

  const setSearch = (search: string) => onChange({ ...value, search });

  const toggleCategory = (categoryId: string) => {
    const categories = value.categories.includes(categoryId)
      ? value.categories.filter((c) => c !== categoryId)
      : [...value.categories, categoryId];
    onChange({ ...value, categories });
  };

  const minPct = (value.budgetMin / FILTER_BUDGET_MAX) * 100;
  const maxPct = (value.budgetMax / FILTER_BUDGET_MAX) * 100;

  return (
    <div className={styles.root}>
      <label className={styles.group} htmlFor="orders-filter-search">
        <span className={styles.groupLabel}>{t("filterSearch")}</span>
        <span className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} aria-hidden />
          <input
            id="orders-filter-search"
            className={styles.searchInput}
            value={value.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("filterSearch")}
          />
        </span>
      </label>

      <div className={styles.group}>
        <p className={styles.groupLabel}>{t("filterCategory")}</p>
        {categoriesError ? (
          <p className="mipoveGuestText mipoveGuestText--errorLight">{categoriesError}</p>
        ) : categoriesLoading ? (
          <p className={styles.categoriesHint}>{tCommon("loadingEllipsis")}</p>
        ) : (
          <div className={styles.pills}>
            <button
              type="button"
              className={`${styles.pill} ${value.categories.length === 0 ? styles.pillActive : ""}`}
              onClick={() => onChange({ ...value, categories: [] })}
            >
              {t("allCategories")}
            </button>
            {categoryOptions.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`${styles.pill} ${value.categories.includes(id) ? styles.pillActive : ""}`}
                onClick={() => toggleCategory(id)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <label className={styles.group} htmlFor={locationFieldId}>
        <span className={styles.groupLabel}>{t("filterLocation")}</span>
        <span className={styles.locationWrap}>
          <MapPin size={16} className={styles.locationIcon} aria-hidden />
          <CityAutocomplete
            id={locationFieldId}
            value={value.location}
            onChange={(location) => onChange({ ...value, location })}
            onSelect={(v) => onChange({ ...value, location: v })}
            placeholder={t("filterLocationPlaceholder")}
            className={styles.ordersCityAutocomplete}
          />
        </span>
      </label>

      <div className={styles.group}>
        <p className={styles.groupLabel}>{t("filterBudget")}</p>
        <div className={styles.budgetRow}>
          <span className={styles.budgetEdge}>₾ {value.budgetMin.toLocaleString()}</span>
          <div
            className={styles.budgetTrack}
            style={
              {
                "--min-pct": `${minPct}%`,
                "--max-pct": `${maxPct}%`,
              } as CSSProperties
            }
          >
            <div className={styles.budgetRail} aria-hidden />
            <div className={styles.budgetActive} aria-hidden />
            <input
              type="range"
              min={0}
              max={FILTER_BUDGET_MAX}
              step={50}
              value={value.budgetMin}
              onChange={(e) => {
                const nextMin = Math.min(Number(e.target.value), value.budgetMax);
                onChange({ ...value, budgetMin: nextMin });
              }}
              className={styles.budgetInput}
              aria-label={t("filterBudgetMinAria")}
            />
            <input
              type="range"
              min={0}
              max={FILTER_BUDGET_MAX}
              step={50}
              value={value.budgetMax}
              onChange={(e) => {
                const nextMax = Math.max(Number(e.target.value), value.budgetMin);
                onChange({ ...value, budgetMax: nextMax });
              }}
              className={styles.budgetInput}
              aria-label={t("filterBudgetMaxAria")}
            />
          </div>
          <span className={styles.budgetEdge}>₾ {value.budgetMax.toLocaleString()}</span>
        </div>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={value.negotiableOnly}
            onChange={(e) => onChange({ ...value, negotiableOnly: e.target.checked })}
          />
          <span>{t("filterNegotiableOnly")}</span>
        </label>
      </div>

      <button type="button" className={styles.clearBtn} onClick={onClear}>
        {t("clearFilters")}
      </button>
    </div>
  );
}
