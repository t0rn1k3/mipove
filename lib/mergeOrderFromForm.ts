import type { OrderRecord } from "./types";

export function mergeOrderCategoriesFromForm(
  order: OrderRecord,
  formCategoryIds: string[],
): OrderRecord {
  const formCats = formCategoryIds.map((c) => String(c).trim()).filter(Boolean);
  const currentCategories = Array.isArray(order.categories) ? order.categories : [];
  const apiCats =
    currentCategories.length > 0
      ? currentCategories
      : order.category && String(order.category).trim()
        ? [String(order.category).trim()]
        : [];
  const categories = [...new Set([...apiCats, ...formCats])].filter(Boolean);
  const category = categories[0] ?? "";
  return { ...order, categories, category };
}

/** When POST omits `publisher`, fill from form so contact reveal shows name/phone immediately. */
export function mergeOrderPublisherFromForm(
  order: OrderRecord,
  contactName: string,
  contactPhone: string,
): OrderRecord {
  const name = contactName.trim();
  const phone = contactPhone.trim();
  if (!name && !phone) return order;
  const prev = order.publisher ?? {};
  return {
    ...order,
    publisher: {
      ...prev,
      name: (prev.name && String(prev.name).trim()) || name || prev.name,
      phone: (prev.phone && String(prev.phone).trim()) || phone || prev.phone,
    },
  };
}

/**
 * After create/update, fill in any meta the API response omitted so the card
 * immediately reflects the values the user typed.
 */
export function mergeOrderMetaFromForm(
  order: OrderRecord,
  form: {
    locationCity?: string;
    locationLat?: number;
    locationLng?: number;
    budgetMin: number;
    budgetMax: number;
    budgetCurrency?: string;
    priceNegotiable: boolean;
    scheduledAt?: string;
  },
): OrderRecord {
  const orderLocation = String(order.location ?? "").trim();
  const formLocation = String(form.locationCity ?? "").trim();
  const location = orderLocation || formLocation;
  const base = order.locationData;
  const locationData = {
    ...(base ?? {}),
    city: formLocation || (base?.city != null ? String(base.city).trim() : ""),
    lat: form.locationLat ?? base?.lat,
    lng: form.locationLng ?? base?.lng,
    addressText: undefined,
  };

  const orderScheduledAt = String(order.scheduledAt ?? "").trim();
  const scheduledAt = orderScheduledAt || String(form.scheduledAt ?? "").trim();

  const budgetMin =
    order.budgetMin != null && Number.isFinite(order.budgetMin)
      ? order.budgetMin
      : form.budgetMin;
  const budgetMax =
    order.budgetMax != null && Number.isFinite(order.budgetMax)
      ? order.budgetMax
      : form.budgetMax;

  /** Always use the submitted form value: API often returns `false` before the field is persisted. */
  const priceNegotiable = form.priceNegotiable;

  const budget = order.budget ?? {
    min: form.budgetMin,
    max: form.budgetMax,
    currency: form.budgetCurrency || "GEL",
  };

  return {
    ...order,
    location,
    locationData,
    deadline: "",
    scheduledAt: scheduledAt || undefined,
    priceNegotiable,
    budgetMin,
    budgetMax,
    budget,
  };
}
