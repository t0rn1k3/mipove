"use client";

import { useCallback, useId, useMemo, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import type { OrderCategoryOption } from "@/lib/types";
import styles from "./OrderSubmissionForm.module.css";

const BUDGET_MAX = 5000;

const TOTAL_STEPS = 4;

export type OrderFormState = {
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
};

const initialState: OrderFormState = {
  title: "",
  categories: [],
  description: "",
  contactName: "",
  contactPhone: "",
  locationCity: "",
  locationLat: undefined,
  locationLng: undefined,
  budgetMin: 0,
  budgetMax: BUDGET_MAX,
  budgetCurrency: "GEL",
  priceNegotiable: false,
  scheduledAt: "",
};

export default function OrderSubmissionForm({
  onSubmit,
  embedded = false,
  initialValues,
  submitLabel,
  categoryOptions,
}: {
  onSubmit?: (data: OrderFormState) => void | Promise<void>;
  embedded?: boolean;
  initialValues?: Partial<OrderFormState>;
  submitLabel?: string;
  categoryOptions: OrderCategoryOption[];
}) {
  const t = useTranslations("orderForm");
  const formId = useId();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OrderFormState>({
    ...initialState,
    ...initialValues,
    categories: initialValues?.categories ?? initialState.categories,
    contactName: initialValues?.contactName ?? initialState.contactName,
    contactPhone: initialValues?.contactPhone ?? initialState.contactPhone,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const stepNavItems = useMemo(
    () => [
      { number: 1 as const, title: t("stepNavBasics") },
      { number: 2 as const, title: t("stepNavCategory") },
      { number: 3 as const, title: t("stepNavMedia") },
      { number: 4 as const, title: t("stepNavBudget") },
    ],
    [t],
  );

  const setField = useCallback(<K extends keyof OrderFormState>(key: K, value: OrderFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key as string];
      if (key === "budgetMin" || key === "budgetMax") delete next.budget;
      return next;
    });
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setForm((prev) => {
      const has = prev.categories.includes(id);
      const categories = has ? prev.categories.filter((c) => c !== id) : [...prev.categories, id];
      return { ...prev, categories };
    });
    setErrors((e) => {
      const next = { ...e };
      delete next.categories;
      return next;
    });
  }, []);

  const validateStep = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 1) {
      if (!form.title.trim()) next.title = t("errorTitle");
      if (!form.description.trim()) next.description = t("errorDescription");
      if (!form.contactName.trim()) next.contactName = t("errorContactName");
      if (!form.contactPhone.trim()) next.contactPhone = t("errorContactPhone");
    }
    if (s === 2) {
      if (categoryOptions.length === 0) {
        next.categories = t("noCategoriesAvailable");
      } else if (form.categories.length === 0) {
        next.categories = t("errorCategory");
      }
    }
    if (s === 3) {
      if (!form.locationCity.trim()) next.location = t("errorLocation");
    }
    if (s === 4) {
      if (!form.priceNegotiable) {
        const { budgetMin: lo, budgetMax: hi } = form;
        if (
          !Number.isFinite(lo) ||
          !Number.isFinite(hi) ||
          lo < 0 ||
          hi > BUDGET_MAX ||
          lo > hi
        ) {
          next.budget = t("errorBudget");
        }
      }
      if (!form.scheduledAt.trim()) next.scheduledAt = t("errorDeadline");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((x) => Math.min(TOTAL_STEPS, x + 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((x) => Math.max(1, x - 1));
  };

  /** Block native / implicit submit (e.g. Enter in inputs) so save only runs from the explicit button. */
  const preventImplicitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const submitFromButton = async () => {
    if (!validateStep(TOTAL_STEPS)) return;
    setSubmitting(true);
    try {
      await onSubmit?.(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className={`${styles.form} ${embedded ? styles.formEmbedded : ""}`}
      onSubmit={preventImplicitSubmit}
      noValidate
    >
      <div className={styles.steps} aria-label={t("stepsAria")}>
        {stepNavItems.map((stepItem) => (
          <div
            key={stepItem.number}
            className={`${styles.stepDotContainer} ${stepItem.number <= step ? styles.stepDotContainerActive : ""}`}
          >
            <span
              className={`${styles.stepDot} ${stepItem.number <= step ? styles.stepDotActive : ""} ${
                stepItem.number === step ? styles.stepDotCurrent : ""
              }`}
            >
              {stepItem.number}
            </span>
            <span className={styles.stepDotText}>{stepItem.title}</span>
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>{t("step1Heading")}</h2>
          <label className={styles.label} htmlFor={`${formId}-title`}>
            {t("projectTitle")}
          </label>
          <input
            id={`${formId}-title`}
            className={`${styles.input} ${errors.title ? styles.fieldError : ""}`}
            type="text"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder={t("projectTitlePlaceholder")}
            autoComplete="off"
          />
          {errors.title ? <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.title}</p> : null}

          <label className={styles.label} htmlFor={`${formId}-desc`}>
            {t("description")}
          </label>
          <textarea
            id={`${formId}-desc`}
            className={`${styles.textarea} ${errors.description ? styles.fieldError : ""}`}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={6}
          />
          {errors.description ? (
            <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.description}</p>
          ) : null}

          <p className={styles.fieldHint}>{t("contactHint")}</p>
          <label className={styles.label} htmlFor={`${formId}-contact-name`}>
            {t("contactName")}
          </label>
          <input
            id={`${formId}-contact-name`}
            className={`${styles.input} ${errors.contactName ? styles.fieldError : ""}`}
            type="text"
            value={form.contactName}
            onChange={(e) => setField("contactName", e.target.value)}
            placeholder={t("contactNamePlaceholder")}
            autoComplete="name"
          />
          {errors.contactName ? (
            <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.contactName}</p>
          ) : null}

          <label className={styles.label} htmlFor={`${formId}-contact-phone`}>
            {t("contactPhone")}
          </label>
          <input
            id={`${formId}-contact-phone`}
            className={`${styles.input} ${errors.contactPhone ? styles.fieldError : ""}`}
            type="tel"
            value={form.contactPhone}
            onChange={(e) => setField("contactPhone", e.target.value)}
            placeholder={t("contactPhonePlaceholder")}
            autoComplete="tel"
          />
          {errors.contactPhone ? (
            <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.contactPhone}</p>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>{t("stepCategoryHeading")}</h2>
          <p className={styles.categoryHint}>{t("stepCategoryHint")}</p>
          <p className={styles.label}>{t("category")}</p>
          {categoryOptions.length > 0 ? (
            <div className={styles.categoryPills} role="group" aria-label={t("category")}>
              {categoryOptions.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.categoryPill} ${form.categories.includes(id) ? styles.categoryPillActive : ""}`}
                  onClick={() => toggleCategory(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
          {errors.categories ? (
            <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.categories}</p>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>{t("step2Heading")}</h2>
          <p className={styles.fieldHint}>{t("locationStepHint")}</p>
          <span className={styles.label}>{t("location")}</span>
          <div className={styles.locationInput}>
          <CityAutocomplete
            id={`${formId}-location`}
            value={form.locationCity}
            onChange={(v) => {
              setField("locationCity", v);
              if (!v.trim()) {
                setField("locationLat", undefined);
                setField("locationLng", undefined);
              }
            }}
            onSelect={(_value, city) => {
              setField("locationCity", city.name);
              setField("locationLat", city.latitude);
              setField("locationLng", city.longitude);
            }}
            placeholder={t("locationPlaceholder")}
            className={errors.location ? styles.selectError : ""}
          />
          </div>
          {errors.location ? (
            <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.location}</p>
          ) : null}
        </div>
      ) : null}

      {step === 4 ? (
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>{t("step3Heading")}</h2>
          <p className={styles.fieldHint}>{t("budgetHeading")}</p>
          <label className={styles.negotiableRow}>
            <input
              type="checkbox"
              checked={form.priceNegotiable}
              onChange={(e) => {
                const checked = e.target.checked;
                setForm((prev) => ({
                  ...prev,
                  priceNegotiable: checked,
                  ...(checked ? { budgetMin: 0, budgetMax: BUDGET_MAX } : {}),
                }));
                setErrors((err) => {
                  const n = { ...err };
                  delete n.budget;
                  return n;
                });
              }}
            />
            <span>{t("priceNegotiable")}</span>
          </label>
          <div
            className={`${styles.budgetRangeBlock} ${
              form.priceNegotiable ? styles.budgetRowDisabled : ""
            }`}
          >
            <span className={styles.sublabel}>{t("budgetRangeLabel")}</span>
            <div className={styles.budgetDualRow}>
              <span className={styles.budgetDualEnd} aria-live="polite">
                ₾ {form.budgetMin.toLocaleString()}
              </span>
              <div
                className={styles.budgetDualTrack}
                style={
                  {
                    "--min-pct": `${(form.budgetMin / BUDGET_MAX) * 100}%`,
                    "--max-pct": `${(form.budgetMax / BUDGET_MAX) * 100}%`,
                  } as CSSProperties
                }
              >
                <div className={styles.budgetDualRail} aria-hidden />
                <div className={styles.budgetDualActive} aria-hidden />
                <input
                  type="range"
                  min={0}
                  max={BUDGET_MAX}
                  step={50}
                  value={form.budgetMin}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setForm((prev) => {
                      const nextMax = prev.budgetMax;
                      return {
                        ...prev,
                        budgetMin: Math.min(v, nextMax),
                      };
                    });
                    setErrors((err) => {
                      const n = { ...err };
                      delete n.budget;
                      return n;
                    });
                  }}
                  className={`${styles.budgetDualInput} ${styles.budgetDualInputMin} ${
                    errors.budget ? styles.budgetDualInputError : ""
                  }`}
                  style={{ zIndex: form.budgetMin > BUDGET_MAX - 500 ? 4 : 3 }}
                  id={`${formId}-budget-min`}
                  disabled={form.priceNegotiable}
                  aria-label={t("budgetMinAria")}
                  aria-valuemin={0}
                  aria-valuemax={BUDGET_MAX}
                  aria-valuenow={form.budgetMin}
                />
                <input
                  type="range"
                  min={0}
                  max={BUDGET_MAX}
                  step={50}
                  value={form.budgetMax}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setForm((prev) => {
                      const nextMin = prev.budgetMin;
                      return {
                        ...prev,
                        budgetMax: Math.max(v, nextMin),
                      };
                    });
                    setErrors((err) => {
                      const n = { ...err };
                      delete n.budget;
                      return n;
                    });
                  }}
                  className={`${styles.budgetDualInput} ${styles.budgetDualInputMax} ${
                    errors.budget ? styles.budgetDualInputError : ""
                  }`}
                  style={{ zIndex: form.budgetMin > BUDGET_MAX - 500 ? 3 : 4 }}
                  id={`${formId}-budget-max`}
                  disabled={form.priceNegotiable}
                  aria-label={t("budgetMaxAria")}
                  aria-valuemin={0}
                  aria-valuemax={BUDGET_MAX}
                  aria-valuenow={form.budgetMax}
                />
              </div>
              <span className={styles.budgetDualEnd} aria-live="polite">
                ₾ {form.budgetMax.toLocaleString()}
              </span>
            </div>
          </div>
          {errors.budget ? <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.budget}</p> : null}
          <label className={styles.label} htmlFor={`${formId}-budget-currency`}>
            {t("budgetCurrency")}
          </label>
          <input
            id={`${formId}-budget-currency`}
            className={styles.input}
            type="text"
            value={form.budgetCurrency}
            onChange={(e) => setField("budgetCurrency", e.target.value.toUpperCase())}
            placeholder={t("currencyCodePlaceholder")}
            maxLength={8}
          />

          <label className={styles.label} htmlFor={`${formId}-scheduled-at`}>
            {t("scheduledAt")}
          </label>
          <input
            id={`${formId}-scheduled-at`}
            className={`${styles.input} ${errors.scheduledAt ? styles.fieldError : ""}`}
            type="date"
            value={form.scheduledAt}
            onChange={(e) => setField("scheduledAt", e.target.value)}
          />
          {errors.scheduledAt ? (
            <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.scheduledAt}</p>
          ) : null}
        </div>
      ) : null}

      <div className={styles.actions}>
        {step > 1 ? (
          <button type="button" className={styles.btnSecondary} onClick={goBack}>
            {t("back")}
          </button>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <button type="button" className={styles.btnPrimary} onClick={goNext}>
            {t("next")}
          </button>
        ) : (
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={submitting}
            onClick={() => void submitFromButton()}
          >
            {submitting ? t("submitting") : (submitLabel ?? t("submit"))}
          </button>
        )}
      </div>
    </form>
  );
}
