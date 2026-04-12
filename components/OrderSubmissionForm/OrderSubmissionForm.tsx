"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Hammer, Wrench } from "lucide-react";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import type { OrderCategoryOption, SelectOption } from "@/lib/types";
import styles from "./OrderSubmissionForm.module.css";

const REGION_VALUES = [
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

const DEADLINE_VALUES = ["urgent", "week", "month"] as const;

const DEADLINE_MSG_KEYS: Record<(typeof DEADLINE_VALUES)[number], string> = {
  urgent: "deadlineUrgent",
  week: "deadlineWeek",
  month: "deadlineMonth",
};

const REGION_MSG_KEYS: Record<(typeof REGION_VALUES)[number], string> = {
  tbilisi: "regionTbilisi",
  batumi: "regionBatumi",
  kutaisi: "regionKutaisi",
  rustavi: "regionRustavi",
  zugdidi: "regionZugdidi",
  gori: "regionGori",
  poti: "regionPoti",
  telavi: "regionTelavi",
  akhaltsikhe: "regionAkhaltsikhe",
  mtskheta: "regionMtskheta",
  other: "regionOther",
};

const BUDGET_MAX = 5000;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

const TOTAL_STEPS = 4;

export type OrderFormState = {
  title: string;
  categories: string[];
  description: string;
  images: File[];
  location: string;
  budgetMin: number;
  budgetMax: number;
  priceNegotiable: boolean;
  deadline: (typeof DEADLINE_VALUES)[number] | "";
};

const initialState: OrderFormState = {
  title: "",
  categories: [],
  description: "",
  images: [],
  location: "",
  budgetMin: 0,
  budgetMax: BUDGET_MAX,
  priceNegotiable: false,
  deadline: "",
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OrderFormState>({
    ...initialState,
    ...initialValues,
    categories: initialValues?.categories ?? initialState.categories,
    images: initialValues?.images ?? [],
  });
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (form.images.length === 0) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(form.images[0]);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.images]);

  const regionOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: t("locationPlaceholder") },
      ...REGION_VALUES.map((v) => ({
        value: v,
        label: t(REGION_MSG_KEYS[v] as "regionTbilisi"),
      })),
    ],
    [t],
  );

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

  const addFiles = useCallback((list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (incoming.length === 0) return;
    const oversized = incoming.find((f) => f.size > MAX_FILE_BYTES);
    if (oversized) {
      setErrors((prev) => ({ ...prev, images: t("errorFileSize") }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...incoming].slice(0, 8),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.images;
      return next;
    });
  }, [t]);

  const validateStep = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 1) {
      if (!form.title.trim()) next.title = t("errorTitle");
      if (!form.description.trim()) next.description = t("errorDescription");
    }
    if (s === 2) {
      if (categoryOptions.length === 0) {
        next.categories = t("noCategoriesAvailable");
      } else if (form.categories.length === 0) {
        next.categories = t("errorCategory");
      }
    }
    if (s === 3) {
      if (!form.location) next.location = t("errorLocation");
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
      if (!form.deadline) next.deadline = t("errorDeadline");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      onSubmit={handleSubmit}
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
          <p className={styles.fieldHint}>{t("visualsHeading")}</p>
          <div
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""} ${
              form.images.length ? styles.dropzoneHasFile : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label={t("dropPrompt")}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
              multiple
              className={styles.hiddenInput}
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) addFiles(files);
                e.target.value = "";
              }}
            />
            {previewUrl && form.images.length > 0 ? (
              <div className={styles.previewWrap}>
                <Image
                  src={previewUrl}
                  alt=""
                  width={200}
                  height={140}
                  className={styles.previewImg}
                  unoptimized
                />
                <span className={styles.previewBadge}>
                  {t("imageCount", { count: form.images.length })}
                </span>
              </div>
            ) : (
              <div className={styles.dropzonePlaceholder}>
                <span className={styles.toolIcons} aria-hidden>
                  <Hammer size={32} strokeWidth={1.75} />
                  <Wrench size={28} strokeWidth={1.75} />
                </span>
                <span className={styles.dropzoneText}>{t("dropPrompt")}</span>
                <span className={styles.dropzoneHint}>{t("dropHint")}</span>
              </div>
            )}
          </div>
          {errors.images ? <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.images}</p> : null}
          {form.images.length > 0 ? (
            <button
              type="button"
              className={styles.textBtn}
              onClick={(e) => {
                e.stopPropagation();
                setField("images", []);
              }}
            >
              {t("clearImages")}
            </button>
          ) : null}

          <span className={styles.label}>{t("location")}</span>
          <CustomSelect
            id={`${formId}-location`}
            options={regionOptions}
            value={form.location}
            onChange={(v) => setField("location", v)}
            placeholder={t("locationPlaceholder")}
            aria-label={t("location")}
            className={errors.location ? styles.selectError : ""}
          />
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

          <p className={`${styles.fieldHint} ${styles.deadlineHint}`}>{t("deadlineHeading")}</p>
          <div className={styles.deadlineGroup} role="group" aria-label={t("deadlineHeading")}>
            {DEADLINE_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.deadlinePill} ${
                  form.deadline === value ? styles.deadlinePillActive : ""
                } ${errors.deadline ? styles.deadlinePillError : ""}`}
                onClick={() => setField("deadline", value)}
              >
                {t(DEADLINE_MSG_KEYS[value] as "deadlineUrgent")}
              </button>
            ))}
          </div>
          {errors.deadline ? (
            <p className="mipoveGuestText mipoveGuestText--errorLight">{errors.deadline}</p>
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
          <button type="submit" className={styles.btnPrimary} disabled={submitting}>
            {submitting ? t("submitting") : (submitLabel ?? t("submit"))}
          </button>
        )}
      </div>
    </form>
  );
}
