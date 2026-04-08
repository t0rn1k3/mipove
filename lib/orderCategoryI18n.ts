import type { OrderCategoryOption } from "./types";

type OrderNsT = {
  (key: string): string;
  has(key: string): boolean;
};

/** Uses `order.orderCategories.<id>` when present; otherwise the API label. */
export function mapOrderCategoriesWithLabels(
  options: OrderCategoryOption[],
  t: OrderNsT,
): OrderCategoryOption[] {
  return options.map(({ id, label }) => {
    const key = `orderCategories.${id}`;
    const translated = t.has(key) ? t(key) : label;
    return { id, label: translated };
  });
}
