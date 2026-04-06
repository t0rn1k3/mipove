"use client";

import { type CSSProperties } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import type { SelectOption } from "@/lib/types";
import styles from "./ordersSmartFilter.module.css";

export const FILTER_BUDGET_MAX = 5000;

export const FILTER_CATEGORY_VALUES = ["wood", "clay", "metal", "textiles", "restoration"] as const;
export const FILTER_DEADLINE_VALUES = ["urgent", "week", "month"] as const;
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

const CATEGORY_MSG_KEYS: Record<(typeof FILTER_CATEGORY_VALUES)[number], string> = {
  wood: "filterCategoryWood",
  clay: "filterCategoryClay",
  metal: "filterCategoryMetal",
  textiles: "filterCategoryTextiles",
  restoration: "filterCategoryRestoration",
};

const DEADLINE_MSG_KEYS: Record<(typeof FILTER_DEADLINE_VALUES)[number], string> = {
  urgent: "filterDeadlineUrgent",
  week: "filterDeadlineWeek",
  month: "filterDeadlineMonth",
};

const LOCATION_MSG_KEYS: Record<(typeof FILTER_LOCATION_VALUES)[number], string> = {
  tbilisi: "filterLocationTbilisi",
  batumi: "filterLocationBatumi",
  kutaisi: "filterLocationKutaisi",
  rustavi: "filterLocationRustavi",
  zugdidi: "filterLocationZugdidi",
  gori: "filterLocationGori",
  poti: "filterLocationPoti",
  telavi: "filterLocationTelavi",
  akhaltsikhe: "filterLocationAkhaltsikhe",
  mtskheta: "filterLocationMtskheta",
  other: "filterLocationOther",
};

export type OrderFilterState = {
  search: string;
  categories: string[];
  location: string;
  budgetMin: number;
  budgetMax: number;
  negotiableOnly: boolean;
  deadlines: string[];
};

type OrdersSmartFilterProps = {
  value: OrderFilterState;
  onChange: (next: OrderFilterState) => void;
  onClear: () => void;
};

export default function OrdersSmartFilter({ value, onChange, onClear }: OrdersSmartFilterProps) {
  const t = useTranslations("order");

  const locationOptions: SelectOption[] = [
    { value: "", label: t("allLocations") },
    ...FILTER_LOCATION_VALUES.map((v) => ({
      value: v,
      label: t(LOCATION_MSG_KEYS[v] as "filterLocationTbilisi"),
    })),
  ];

  const setSearch = (search: string) => onChange({ ...value, search });

  const toggleCategory = (category: string) => {
    const categories = value.categories.includes(category)
      ? value.categories.filter((c) => c !== category)
      : [...value.categories, category];
    onChange({ ...value, categories });
  };

  const toggleDeadline = (deadline: string) => {
    const deadlines = value.deadlines.includes(deadline)
      ? value.deadlines.filter((d) => d !== deadline)
      : [...value.deadlines, deadline];
    onChange({ ...value, deadlines });
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
        <div className={styles.pills}>
          <button
            type="button"
            className={`${styles.pill} ${value.categories.length === 0 ? styles.pillActive : ""}`}
            onClick={() => onChange({ ...value, categories: [] })}
          >
            {t("allCategories")}
          </button>
          {FILTER_CATEGORY_VALUES.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.pill} ${value.categories.includes(category) ? styles.pillActive : ""}`}
              onClick={() => toggleCategory(category)}
            >
              {t(CATEGORY_MSG_KEYS[category] as "filterCategoryWood")}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>{t("filterLocation")}</p>
        <CustomSelect
          id="orders-filter-location"
          value={value.location}
          options={locationOptions}
          onChange={(location) => onChange({ ...value, location })}
          placeholder={t("allLocations")}
          aria-label={t("filterLocation")}
        />
      </div>

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
              aria-label="Minimum budget"
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
              aria-label="Maximum budget"
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

      <div className={styles.group}>
        <p className={styles.groupLabel}>{t("filterTimeline")}</p>
        <div className={styles.pills}>
          {FILTER_DEADLINE_VALUES.map((deadline) => (
            <button
              key={deadline}
              type="button"
              className={`${styles.pill} ${value.deadlines.includes(deadline) ? styles.pillActive : ""}`}
              onClick={() => toggleDeadline(deadline)}
            >
              {t(DEADLINE_MSG_KEYS[deadline] as "filterDeadlineUrgent")}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className={styles.clearBtn} onClick={onClear}>
        {t("clearFilters")}
      </button>
    </div>
  );
}
