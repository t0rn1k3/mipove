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
