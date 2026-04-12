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
  const categories = apiCats.length > 0 ? apiCats : formCats;
  const category = categories[0] ?? "";
  return { ...order, categories, category };
}
