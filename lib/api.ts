import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  RatedMasterItem,
  MasterListItem,
  UpdateProfileInput,
  AdminStats,
  AdminUser,
  AdminMaster,
  AdminRegisterInput,
  GeocodeCity,
  Professions,
  OrderRecord,
  OrderUpsertInput,
  OrderCategoryOption,
  CreditHistoryResult,
  CreditTransaction,
  SpendCreditsResult,
  CreditPack,
  RatingSummary,
} from "./types";
import { InsufficientCreditsError } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/** Origin hosting the API (no `/api` suffix), e.g. `http://localhost:5000`. */
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");

/** No trailing slash. Legacy `/uploads/...` paths resolve here + path, or stay root-relative for Next `/uploads` rewrite. */
const FRONTEND_ORIGIN = (process.env.NEXT_PUBLIC_FRONTEND_URL || "").replace(/\/$/, "");

/** Purge any leftover localStorage tokens from older builds. Auth is cookie-only. */
if (typeof window !== "undefined") {
  localStorage.removeItem("mipove_token");
  localStorage.removeItem("mipove_access_token_v1");
}

/**
 * Resolve `image`, `portfolioImages`, `attachments`, etc.
 * - Full `http(s)://...` (B2, CDN): use as `src` as-is — do not prefix API origin.
 * - Legacy `/uploads/...`: `NEXT_PUBLIC_FRONTEND_URL + path`, or root-relative `path` if unset (same-origin + Next rewrite to API).
 */
export function getImageUrl(path: string | undefined): string {
  if (!path) return "";
  const trimmed = path.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) {
    return FRONTEND_ORIGIN ? `${FRONTEND_ORIGIN}${trimmed}` : trimmed;
  }
  return trimmed;
}

/**
 * Portfolio DELETE must use URLs as stored on the master (`portfolioImages`).
 * Strip known public/API origins and query/hash so <img> / Next Image src matches DB.
 */
function normalizePortfolioDeleteUrl(resolved: string): string {
  let s = resolved.trim();
  if (!s) return s;
  if (API_ORIGIN && s.startsWith(API_ORIGIN)) {
    s = s.slice(API_ORIGIN.length);
    if (!s.startsWith("/")) s = `/${s}`;
  }
  if (FRONTEND_ORIGIN && s.startsWith(FRONTEND_ORIGIN)) {
    s = s.slice(FRONTEND_ORIGIN.length);
    if (!s.startsWith("/")) s = `/${s}`;
  }
  const q = s.indexOf("?");
  if (q !== -1) s = s.slice(0, q);
  const h = s.indexOf("#");
  if (h !== -1) s = s.slice(0, h);
  return s;
}

const api = (path: string) =>
  `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch(`${api("/auth/refresh")}`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}

type AuthFetchInit = RequestInit | (() => RequestInit);

async function authFetch(url: string, initOrFactory: AuthFetchInit): Promise<Response> {
  const getInit = typeof initOrFactory === "function" ? initOrFactory : () => initOrFactory;
  let init = getInit();
  let res = await fetch(url, { ...init, credentials: "include" });
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new Error("Session expired. Please log in again.");
    init = getInit();
    res = await fetch(url, { ...init, credentials: "include" });
  }
  return res;
}

async function readJsonSafe(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function extractMessage(json: Record<string, unknown>, fallback: string): string {
  const maybeMessage = json.message;
  if (typeof maybeMessage !== "string" || !maybeMessage.trim()) return fallback;
  const message = maybeMessage.trim();
  // Hide infra-level backend errors from users (DB/network outages, DNS, etc.).
  if (
    /ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|Mongo(Network|Server)?Error|failed to connect/i.test(
      message,
    )
  ) {
    return "Server is temporarily unavailable. Please try again in a moment.";
  }
  return message;
}

export async function getOrderCategories(): Promise<OrderCategoryOption[]> {
  const res = await fetch(`${api("/orders/categories")}`, { credentials: "include" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load categories"));
  const raw = json.categories;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row): OrderCategoryOption | null => {
      const o = row as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : "";
      const label = typeof o.label === "string" ? o.label : "";
      if (!id || !label) return null;
      return { id, label };
    })
    .filter((x): x is OrderCategoryOption => x != null);
}

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  const res = await fetch(`${api("/auth/users/register")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, phone: data.phone || "" }),
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

export async function registerMaster(
  data: RegisterInput,
): Promise<AuthResponse> {
  const res = await fetch(`${api("/auth/masters/register")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, phone: data.phone || "" }),
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const res = await fetch(`${api("/auth/login")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json;
}

export async function logout(): Promise<void> {
  await fetch(`${api("/auth/logout")}`, {
    method: "POST",
    credentials: "include",
  });
}

export function getAuthRedirectPath(json: {
  data?: { role?: string; slug?: string };
  user?: { role?: string; slug?: string };
  admin?: { role?: string; slug?: string };
}): string {
  const data = json.data ?? json.user ?? json.admin;
  const role = data?.role;
  if (role === "admin") return "/admin";
  if (role === "master" && data?.slug) return `/profile/${data.slug}`;
  if (role === "user") return "/";
  return "/profile/me";
}

export async function getMe(): Promise<{
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    slug?: string;
    phone?: string;
    specialty?: string;
    location?: string;
    bio?: string;
    rating?: number | RatingSummary;
    image?: string;
    instagram?: string;
    website?: string;
    works?: Array<{
      id: string;
      title: string;
      description?: string;
      image: string;
    }>;
    portfolioImages?: string[];
    ratedMasters?: RatedMasterItem[];
  };
}> {
  const res = await authFetch(`${api("/auth/me")}`, {});
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to get user");
  return json;
}

export async function getProfile(): Promise<Awaited<ReturnType<typeof getMe>>> {
  const res = await authFetch(`${api("/auth/profile")}`, {});
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to get profile");
  return json;
}

export async function getProfessions(): Promise<Professions[]> {
  const res = await fetch(`${api("/masters/professions")}`, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failet to get professions");
  return json.data ?? json as Professions[];
}
export async function searchCities(query: string, count = 10): Promise<GeocodeCity[]> {
  if (!query || query.trim().length < 2) return [];
  const q = encodeURIComponent(query.trim());
  const url = `${api("/geocode/search")}?q=${q}&count=${count}`;
  const res = await fetch(url, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) {
    if (typeof window !== "undefined") {
      console.warn("[searchCities] API error:", res.status, json?.message ?? json);
    }
    return [];
  }
  const data = json?.data ?? json?.results ?? json;
  return Array.isArray(data) ? data : [];
}

export async function getMasters(params?: {
  location?: string;
  specialty?: string;
  search?: string;
}): Promise<MasterListItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.location) searchParams.set("location", params.location);
  if (params?.specialty) searchParams.set("specialty", params.specialty);
  if (params?.search) searchParams.set("search", params.search);
  const q = searchParams.toString() ? `?${searchParams}` : "";
  const res = await fetch(api(`/masters${q}`), { credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch masters");
  const data = json.data ?? json;
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const record = row as Record<string, unknown>;
    const ratingRaw = record.rating;
    const ratingFromObject =
      ratingRaw && typeof ratingRaw === "object" && !Array.isArray(ratingRaw)
        ? (ratingRaw as Record<string, unknown>)
        : null;
    const average =
      typeof ratingFromObject?.average === "number"
        ? ratingFromObject.average
        : typeof ratingRaw === "number"
          ? ratingRaw
          : undefined;
    const count =
      typeof ratingFromObject?.count === "number"
        ? ratingFromObject.count
        : typeof record.reviewCount === "number"
          ? record.reviewCount
          : undefined;
    const rating =
      average != null || count != null
        ? {
            average: average ?? 0,
            count: count ?? 0,
          }
        : undefined;
    return {
      ...(row as MasterListItem),
      rating,
    };
  });
}

export async function getProfileBySlug(slug: string): Promise<{
  name: string;
  specialty: string;
  location: string;
  bio: string;
  rating?: RatingSummary;
  phone: string;
  email: string;
  instagram?: string;
  website?: string;
  image: string;
  portfolioImages?: string[];
  works: Array<{
    id: string;
    title: string;
    description?: string;
    image: string;
  }>;
}> {
  const res = await fetch(`${api(`/masters/${slug}`)}`, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Profile not found");
  const data = json.data ?? json;
  const ratingRaw = data?.rating;
  const ratingObj =
    ratingRaw && typeof ratingRaw === "object" && !Array.isArray(ratingRaw)
      ? (ratingRaw as Record<string, unknown>)
      : null;
  const ratingAverage =
    typeof ratingObj?.average === "number"
      ? ratingObj.average
      : typeof ratingRaw === "number"
        ? ratingRaw
        : undefined;
  const ratingCount =
    typeof ratingObj?.count === "number"
      ? ratingObj.count
      : typeof data?.reviewCount === "number"
        ? data.reviewCount
        : undefined;
  return {
    ...data,
    rating:
      ratingAverage != null || ratingCount != null
        ? {
            average: ratingAverage ?? 0,
            count: ratingCount ?? 0,
          }
        : undefined,
    image: getImageUrl(data.image),
    portfolioImages: (data.portfolioImages ?? []).map((p: string) => getImageUrl(p)),
    works: (data.works ?? []).map((w: { _id?: string; id?: string }) => ({
      ...w,
      id: w._id ?? w.id ?? "",
    })),
  };
}


export async function rateMaster(
  slug: string,
  stars: number,
): Promise<{
  data?: {
    stars?: number;
    rating?: RatingSummary;
    ratedMasters?: RatedMasterItem[];
  };
}> {
  const s = Math.min(5, Math.max(1, Math.round(stars)));
  const res = await authFetch(`${api(`/masters/${encodeURIComponent(slug)}/rate`)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stars: s }),
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error("Invalid response from server");
    }
  }
  if (!res.ok) {
    throw new Error(
      typeof json.message === "string" ? json.message : "Failed to save rating",
    );
  }
  // Support both `{ data: { ... } }` and flat `{ ratedMasters, rating, ... }`. 
  const raw = json.data;
  const inner =
    raw != null && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : json;
  const ratedRaw = inner.ratedMasters;
  const ratedMasters = Array.isArray(ratedRaw)
    ? (ratedRaw as RatedMasterItem[])
    : undefined;
  const ratingRaw = inner.rating;
  const ratingObj =
    ratingRaw && typeof ratingRaw === "object" && !Array.isArray(ratingRaw)
      ? (ratingRaw as Record<string, unknown>)
      : null;
  const ratingAverage =
    typeof ratingObj?.average === "number"
      ? ratingObj.average
      : typeof ratingRaw === "number"
        ? ratingRaw
        : undefined;
  const ratingCount =
    typeof ratingObj?.count === "number"
      ? ratingObj.count
      : typeof inner.reviewCount === "number"
        ? inner.reviewCount
        : undefined;
  return {
    data: {
      stars: typeof inner.stars === "number" ? inner.stars : undefined,
      rating:
        ratingAverage != null || ratingCount != null
          ? {
              average: ratingAverage ?? 0,
              count: ratingCount ?? 0,
            }
          : undefined,
      ratedMasters,
    },
  };
}

export async function updateProfile(
  data: UpdateProfileInput,
): Promise<{ data: Awaited<ReturnType<typeof getMe>>["data"] }> {
  const res = await authFetch(`${api("/auth/me")}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Update failed");
  return json;
}

export async function uploadProfileImage(
  file: File,
): Promise<{ data: Awaited<ReturnType<typeof getMe>>["data"] }> {
  const res = await authFetch(`${api("/auth/me")}`, () => {
    const form = new FormData();
    form.append("image", file);
    return { method: "PATCH", body: form };
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  return json;
}

export async function fetchMyPortfolio(): Promise<string[]> {
  const res = await authFetch(`${api("/masters/me/portfolio")}`, { method: "GET" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to load portfolio");
  const list = json?.data?.portfolioImages;
  return Array.isArray(list) ? list.map((p: string) => getImageUrl(p)) : [];
}

export async function uploadPortfolioImages(files: File[] | FileList): Promise<string[]> {
  const arr = Array.isArray(files) ? files : Array.from(files);
  const res = await authFetch(`${api("/masters/me/portfolio")}`, () => {
    const form = new FormData();
    for (const f of arr) form.append("images", f);
    return { method: "POST", body: form };
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  const list = json?.data?.portfolioImages;
  return Array.isArray(list) ? list.map((p: string) => getImageUrl(p)) : [];
}

export async function deletePortfolioImages(
  payload: { url: string } | { urls: string[] },
): Promise<string[]> {
  const rawList =
    "url" in payload
      ? [normalizePortfolioDeleteUrl(payload.url)]
      : payload.urls.map((u) => normalizePortfolioDeleteUrl(u));
  const filtered = rawList.filter((u) => u.length > 0);
  if (filtered.length === 0) throw new Error("No valid URLs to delete");

  const deleteInit = (body: Record<string, unknown>): RequestInit => ({
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let body: Record<string, unknown> =
    filtered.length === 1 ? { url: filtered[0] } : { urls: filtered };
  let res = await authFetch(`${api("/masters/me/portfolio")}`, deleteInit(body));
  let json = await readJsonSafe(res);

  if (!res.ok && res.status === 400 && filtered.length === 1 && "url" in body) {
    body = { urls: filtered };
    res = await authFetch(`${api("/masters/me/portfolio")}`, deleteInit(body));
    json = await readJsonSafe(res);
  }

  if (!res.ok) throw new Error(extractMessage(json, "Failed to delete portfolio images"));
  const inner = (json.data ?? json) as Record<string, unknown>;
  const list = inner.portfolioImages;
  return Array.isArray(list) ? list.map((p: string) => getImageUrl(String(p))) : [];
}

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export async function uploadFile(file: File): Promise<string> {
  if (!file) throw new Error("No file selected");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large. Max allowed size is 50MB.");
  }

  const res = await authFetch(`${api("/upload")}`, () => {
    const form = new FormData();
    form.append("file", file);
    return { method: "POST", body: form };
  });

  const json = await readJsonSafe(res);
  if (!res.ok) {
    if (res.status === 401) throw new Error("Session expired. Please log in again.");
    if (res.status === 400) {
      throw new Error(extractMessage(json, "Upload failed. Check file format and size."));
    }
    throw new Error(extractMessage(json, "Upload failed"));
  }

  const url = json.url;
  if (typeof url !== "string" || !url.trim()) {
    throw new Error("Upload succeeded but file URL is missing.");
  }
  return url;
}

function normalizeOrderCategoriesFromRow(row: Record<string, unknown>): string[] {
  const raw = row.categories;
  if (Array.isArray(raw)) {
    return raw.map((c) => String(c).trim()).filter(Boolean);
  }
  const single = row.category;
  if (single != null && String(single).trim() !== "") return [String(single).trim()];
  return [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function extractOrderRecordPayload(json: unknown): Record<string, unknown> {
  const root = asRecord(json);
  const data = asRecord(root?.data);
  const nested =
    asRecord(data?.order) ??
    asRecord(data?.item) ??
    asRecord(root?.order) ??
    asRecord(root?.item);
  return nested ?? data ?? root ?? {};
}

function extractOrderListPayload(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;

  const root = asRecord(json);
  if (!root) return [];

  const dataRaw = root.data;
  if (Array.isArray(dataRaw)) return dataRaw;

  const data = asRecord(dataRaw);
  if (data) {
    for (const key of ["orders", "items", "results", "list", "rows"] as const) {
      const val = data[key];
      if (Array.isArray(val)) return val;
    }
  }

  for (const key of ["orders", "items", "results", "list", "rows"] as const) {
    const val = root[key];
    if (Array.isArray(val)) return val;
  }

  // Last resort: find the first array value in root or root.data
  for (const val of Object.values(data ?? root)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") return val;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn("[extractOrderListPayload] could not find order array in:", JSON.stringify(json).slice(0, 500));
  }

  return [];
}

/** Default page size for GET /orders; keep in sync with orders UI. */
export const ORDERS_PAGE_SIZE = 15;

export type GetOrdersPageResult = {
  orders: OrderRecord[];
  hasMore: boolean;
  nextOffset: number;
};

function tryPaginatedOrdersFromObject(
  obj: Record<string, unknown> | undefined,
  key: "items" | "orders",
  allowLengthHeuristic: boolean,
  limit: number,
  offset: number,
): { rawRows: unknown[]; hasMore: boolean; nextOffset: number } | null {
  if (!obj) return null;
  const arr = obj[key];
  if (!Array.isArray(arr)) return null;
  const hasExplicitMeta =
    typeof obj.hasMore === "boolean" ||
    typeof obj.nextOffset === "number" ||
    typeof obj.total === "number";
  if (!hasExplicitMeta && !(allowLengthHeuristic && key === "items")) return null;

  const hasMore =
    typeof obj.hasMore === "boolean"
      ? obj.hasMore
      : typeof obj.total === "number" && Number.isFinite(obj.total)
        ? offset + arr.length < obj.total
        : allowLengthHeuristic && key === "items"
          ? limit > 0 && arr.length === limit
          : false;
  const nextOffset =
    typeof obj.nextOffset === "number" && Number.isFinite(obj.nextOffset)
      ? obj.nextOffset
      : offset + arr.length;

  return { rawRows: arr, hasMore, nextOffset };
}

function extractPaginatedOrdersPayload(
  json: unknown,
  limit: number,
  offset: number,
): { rawRows: unknown[]; hasMore: boolean; nextOffset: number } {
  const root = asRecord(json);
  const data = asRecord(root?.data);

  const fromPaginated =
    tryPaginatedOrdersFromObject(root ?? undefined, "items", true, limit, offset) ??
    tryPaginatedOrdersFromObject(data ?? undefined, "items", true, limit, offset) ??
    tryPaginatedOrdersFromObject(root ?? undefined, "orders", false, limit, offset) ??
    tryPaginatedOrdersFromObject(data ?? undefined, "orders", false, limit, offset);

  if (fromPaginated) return fromPaginated;

  const legacy = extractOrderListPayload(json);
  return {
    rawRows: legacy,
    hasMore: false,
    nextOffset: offset + legacy.length,
  };
}

function strField(o: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") {
      const t = v.trim();
      if (t) return t;
    }
  }
  return undefined;
}

function extractPublisher(row: Record<string, unknown>): OrderRecord["publisher"] | undefined {
  const pub = row.publisher;
  const rootName = strField(row as Record<string, unknown>, "contactName", "customerName", "customerNameSnapshot");
  const rootPhone = strField(row as Record<string, unknown>, "contactPhone", "customerPhone", "customerPhoneSnapshot");
  if (pub && typeof pub === "object" && !Array.isArray(pub)) {
    const p = pub as Record<string, unknown>;
    const name = strField(p, "name", "displayName", "fullName", "contactName") || rootName;
    const phone = strField(p, "phone", "contactPhone") || rootPhone;
    return {
      _id: typeof p._id === "string" ? p._id : undefined,
      name,
      phone,
      email: typeof p.email === "string" ? p.email : undefined,
    };
  }
  if (rootName || rootPhone) {
    return {
      name: rootName,
      phone: rootPhone,
    };
  }
  return undefined;
}

function extractLocationData(
  row: Record<string, unknown>,
): OrderRecord["locationData"] | undefined {
  const raw = row.location;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    return {
      city: typeof o.city === "string" ? o.city : undefined,
      addressText: typeof o.addressText === "string" ? o.addressText : undefined,
      lat: typeof o.lat === "number" && Number.isFinite(o.lat) ? o.lat : undefined,
      lng: typeof o.lng === "number" && Number.isFinite(o.lng) ? o.lng : undefined,
    };
  }
  if (typeof raw === "string" && raw.trim()) {
    return { addressText: raw.trim() };
  }
  return undefined;
}

function extractBudgetData(row: Record<string, unknown>): OrderRecord["budget"] | undefined {
  const raw = row.budget;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const o = raw as Record<string, unknown>;
  return {
    min: typeof o.min === "number" && Number.isFinite(o.min) ? o.min : undefined,
    max: typeof o.max === "number" && Number.isFinite(o.max) ? o.max : undefined,
    currency: typeof o.currency === "string" ? o.currency : undefined,
  };
}

function extractCustomerSnapshot(
  row: Record<string, unknown>,
): Pick<OrderRecord, "customerNameSnapshot" | "customerPhoneSnapshot" | "user" | "orderingMaster"> {
  const userRaw = row.user;
  const masterRaw = row.orderingMaster;
  const toContact = (value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
    const o = value as Record<string, unknown>;
    return {
      _id: typeof o._id === "string" ? o._id : undefined,
      name: strField(o, "name", "displayName", "fullName", "contactName"),
      phone: strField(o, "phone", "contactPhone"),
      email: typeof o.email === "string" ? o.email : undefined,
    };
  };
  const snapName =
    typeof row.customerNameSnapshot === "string" && row.customerNameSnapshot.trim()
      ? row.customerNameSnapshot.trim()
      : typeof row.customerName === "string" && row.customerName.trim()
        ? row.customerName.trim()
        : undefined;
  const snapPhone =
    typeof row.customerPhoneSnapshot === "string" && row.customerPhoneSnapshot.trim()
      ? row.customerPhoneSnapshot.trim()
      : typeof row.customerPhone === "string" && row.customerPhone.trim()
        ? row.customerPhone.trim()
        : typeof row.contactPhone === "string" && row.contactPhone.trim()
          ? row.contactPhone.trim()
          : undefined;
  return {
    customerNameSnapshot: snapName,
    customerPhoneSnapshot: snapPhone,
    user: toContact(userRaw),
    orderingMaster: toContact(masterRaw),
  };
}

function normalizeOrderRecord(row: Record<string, unknown>): OrderRecord {
  const base = row as OrderRecord;
  const categories = normalizeOrderCategoriesFromRow(row);
  const publisher = extractPublisher(row) ?? base.publisher;
  const locationData = extractLocationData(row);
  const budget = extractBudgetData(row);
  const snapshot = extractCustomerSnapshot(row);
  const rawMin = Number(row.budgetMin ?? budget?.min);
  const rawMax = Number(row.budgetMax ?? budget?.max);
  const locationLabel =
    locationData?.city ||
    locationData?.addressText ||
    (typeof row.location === "string" ? row.location : "");
  const scheduledAt =
    typeof row.scheduledAt === "string"
      ? row.scheduledAt
      : typeof row.deadline === "string"
        ? row.deadline
        : undefined;
  const fallbackName =
    snapshot.customerNameSnapshot?.trim() ||
    snapshot.user?.name?.trim() ||
    snapshot.orderingMaster?.name?.trim();
  const fallbackPhone =
    snapshot.customerPhoneSnapshot?.trim() ||
    snapshot.user?.phone?.trim() ||
    snapshot.orderingMaster?.phone?.trim();
  const mergedPublisher =
    publisher || fallbackName || fallbackPhone
      ? {
          ...publisher,
          name: publisher?.name?.trim() || fallbackName || publisher?.name,
          phone: publisher?.phone?.trim() || fallbackPhone || publisher?.phone,
        }
      : publisher;
  return {
    ...base,
    categories,
    category: categories[0] ?? "",
    budgetMin: Number.isFinite(rawMin) ? rawMin : 0,
    budgetMax: Number.isFinite(rawMax) ? rawMax : 0,
    priceNegotiable: base.priceNegotiable === true || base.priceNegotiable === "true" as unknown,
    attachments: Array.isArray(base.attachments) ? base.attachments : [],
    location: locationLabel,
    locationData,
    budget,
    deadline: typeof row.deadline === "string" ? row.deadline : "",
    scheduledAt,
    customerNameSnapshot: snapshot.customerNameSnapshot,
    customerPhoneSnapshot: snapshot.customerPhoneSnapshot,
    user: snapshot.user,
    orderingMaster: snapshot.orderingMaster,
    publisher: mergedPublisher,
  };
}

function appendOrderFormFields(form: FormData, data: Omit<OrderUpsertInput, "attachments">) {
  form.append("title", data.title);
  const cats =
    data.categories == null
      ? []
      : data.categories.map((c) => String(c).trim()).filter(Boolean);
  if (cats.length > 0) {
    const csv = cats.join(",");
    // Backend accepts string[] or comma-separated string; multipart parsers often
    // coerce to strings, so send canonical CSV for maximum compatibility.
    form.append("categories", csv);
    form.append("category", csv);
  }
  form.append("description", data.description);
  if (data.location) form.append("location", JSON.stringify(data.location));
  if (data.budget) form.append("budget", JSON.stringify(data.budget));
  if (data.scheduledAt) form.append("scheduledAt", data.scheduledAt);
  const cn =
    data.customerNameSnapshot != null ? String(data.customerNameSnapshot).trim() : "";
  const cp =
    data.customerPhoneSnapshot != null ? String(data.customerPhoneSnapshot).trim() : "";
  if (cn) form.append("customerNameSnapshot", cn);
  if (cp) form.append("customerPhoneSnapshot", cp);
}

/** Create order: POST multipart with scalar fields + file attachments. */
export async function createOrder(
  data: Omit<OrderUpsertInput, "attachments"> & { files: File[] },
): Promise<OrderRecord> {
  const form = new FormData();
  appendOrderFormFields(form, data);
  for (const file of data.files) {
    form.append("attachments", file);
  }
  const res = await authFetch(`${api("/orders")}`, () => ({ method: "POST", body: form }));
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to create order"));
  const raw = extractOrderRecordPayload(json);
  return normalizeOrderRecord(raw);
}

export async function getOrders(options?: {
  categories?: string[];
  limit?: number;
  offset?: number;
  /** When true, requests only the current user’s orders (`mine=true`). Backend should scope results to the authenticated publisher. */
  mine?: boolean;
}): Promise<GetOrdersPageResult> {
  const limit = options?.limit ?? ORDERS_PAGE_SIZE;
  const offset = options?.offset ?? 0;
  const q = new URLSearchParams();
  if (limit > 0) q.set("limit", String(limit));
  if (offset > 0) q.set("offset", String(offset));
  if (options?.mine) q.set("mine", "true");
  const cats = options?.categories?.map((c) => c.trim()).filter(Boolean) ?? [];
  if (cats.length > 0) q.set("categories", cats.join(","));
  const path = `/orders?${q.toString()}`;
  const res = await authFetch(`${api(path)}`, { method: "GET" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load orders"));
  const { rawRows, hasMore, nextOffset } = extractPaginatedOrdersPayload(json, limit, offset);
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[getOrders] status=${res.status} parsed=${rawRows.length} hasMore=${hasMore} keys=${JSON.stringify(
        json && typeof json === "object" && !Array.isArray(json) ? Object.keys(json as object) : [],
      )}`,
    );
  }
  return {
    orders: rawRows.map((row) => normalizeOrderRecord(row as Record<string, unknown>)),
    hasMore,
    nextOffset,
  };
}

/** Current user’s orders (GET /orders?mine=true&limit&offset). */
export async function getMyOrders(options?: {
  limit?: number;
  offset?: number;
}): Promise<GetOrdersPageResult> {
  return getOrders({ mine: true, limit: options?.limit, offset: options?.offset });
}

export async function getOrderById(orderId: string): Promise<OrderRecord> {
  const res = await authFetch(`${api(`/orders/${encodeURIComponent(orderId)}`)}`, {
    method: "GET",
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load order"));
  const raw = extractOrderRecordPayload(json);
  return normalizeOrderRecord(raw);
}

export async function updateOrder(orderId: string, data: OrderUpsertInput): Promise<OrderRecord> {
  const { categories: categoriesInput, ...rest } = data;
  const cats =
    categoriesInput == null
      ? []
      : categoriesInput.map((c) => String(c).trim()).filter(Boolean);
  const cn =
    rest.customerNameSnapshot != null ? String(rest.customerNameSnapshot).trim() : "";
  const cp =
    rest.customerPhoneSnapshot != null ? String(rest.customerPhoneSnapshot).trim() : "";
  const res = await authFetch(`${api(`/orders/${encodeURIComponent(orderId)}`)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...rest,
      categories: cats.length > 0 ? cats : null,
      category: cats.length > 0 ? cats[0] : null,
      customerNameSnapshot: cn || null,
      customerPhoneSnapshot: cp || null,
    }),
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to update order"));
  const raw = extractOrderRecordPayload(json);
  return normalizeOrderRecord(raw);
}

export async function deleteOrder(orderId: string): Promise<void> {
  const res = await authFetch(`${api(`/orders/${encodeURIComponent(orderId)}`)}`, {
    method: "DELETE",
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to delete order"));
}

export async function getMasterFavoriteOrders(): Promise<OrderRecord[]> {
  const res = await authFetch(`${api("/masters/me/favorite-orders")}`, { method: "GET" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load favorite orders"));
  const data = extractOrderListPayload(json);
  return data.map((row) => normalizeOrderRecord(row as Record<string, unknown>));
}

export async function addMasterFavoriteOrder(orderId: string): Promise<void> {
  const res = await authFetch(`${api("/masters/me/favorite-orders")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to save favorite order"));
}

export async function removeMasterFavoriteOrder(orderId: string): Promise<void> {
  const encoded = encodeURIComponent(orderId);
  const byPath = await authFetch(`${api(`/masters/me/favorite-orders/${encoded}`)}`, {
    method: "DELETE",
  });
  if (byPath.ok) return;

  const jsonPath = await readJsonSafe(byPath);
  const byBody = await authFetch(`${api("/masters/me/favorite-orders")}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  if (byBody.ok) return;

  const jsonBody = await readJsonSafe(byBody);
  throw new Error(
    extractMessage(jsonBody, extractMessage(jsonPath, "Failed to remove favorite order")),
  );
}

/* ========== Credits ========== */

export async function getCreditBalance(): Promise<{ balance: number }> {
  const res = await authFetch(`${api("/credits/balance")}`, { method: "GET" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load credit balance"));
  const inner = (json.data ?? json) as Record<string, unknown>;
  const balance =
    typeof inner.balance === "number" && Number.isFinite(inner.balance)
      ? inner.balance
      : 0;
  return { balance };
}

export async function getCreditHistory(
  page = 1,
  limit = 20,
): Promise<CreditHistoryResult> {
  const q = new URLSearchParams();
  q.set("page", String(page));
  q.set("limit", String(limit));
  const res = await authFetch(`${api(`/credits/history?${q.toString()}`)}`, { method: "GET" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load credit history"));
  const inner = (json.data ?? json) as Record<string, unknown>;
  const transactionsRaw = inner.transactions;
  const transactions = Array.isArray(transactionsRaw)
    ? (transactionsRaw as CreditTransaction[])
    : [];
  const total =
    typeof inner.total === "number" && Number.isFinite(inner.total)
      ? inner.total
      : transactions.length;
  const pageNum =
    typeof inner.page === "number" && Number.isFinite(inner.page) ? inner.page : page;
  const pages =
    typeof inner.pages === "number" && Number.isFinite(inner.pages) ? inner.pages : Math.max(1, Math.ceil(total / limit));
  return { transactions, total, page: pageNum, pages };
}

export async function spendCredits(
  action: string,
  targetId: string,
): Promise<SpendCreditsResult> {
  const res = await authFetch(`${api("/credits/spend")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, targetId }),
  });
  const json = await readJsonSafe(res);
  if (res.status === 402) {
    const inner = (json.data ?? json) as Record<string, unknown>;
    const required =
      typeof inner.required === "number" && Number.isFinite(inner.required) ? inner.required : 1;
    const balance =
      typeof inner.balance === "number" && Number.isFinite(inner.balance) ? inner.balance : 0;
    throw new InsufficientCreditsError("Insufficient credits", required, balance);
  }
  if (res.status === 429) {
    throw new Error(extractMessage(json, "Too many requests. Please wait and try again."));
  }
  if (!res.ok) throw new Error(extractMessage(json, "Failed to spend credits"));
  const inner = (json.data ?? json) as Record<string, unknown>;
  const success = inner.success === true;
  const remaining =
    typeof inner.remaining === "number" && Number.isFinite(inner.remaining) ? inner.remaining : 0;
  const dataRaw = inner.data;
  const data =
    dataRaw != null && typeof dataRaw === "object" && !Array.isArray(dataRaw)
      ? (dataRaw as { phone?: string; email?: string })
      : undefined;
  return { success, remaining, data };
}

export async function getUnlockedIds(action: string): Promise<string[]> {
  const q = new URLSearchParams();
  q.set("action", action);
  const res = await authFetch(`${api(`/credits/unlocks?${q.toString()}`)}`, { method: "GET" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load credit unlocks"));
  const inner = (json.data ?? json) as Record<string, unknown> | unknown[];
  if (Array.isArray(inner)) {
    return inner.filter((id): id is string => typeof id === "string");
  }
  const raw = (inner as Record<string, unknown>).unlocks;
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string");
}

export async function getCreditPacks(): Promise<CreditPack[]> {
  const res = await fetch(`${api("/credits/packs")}`, { credentials: "include" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load credit packs"));
  const packsTop = json.packs;
  const root = json.data ?? json;
  const raw = Array.isArray(packsTop)
    ? packsTop
    : Array.isArray(root)
      ? root
      : root != null && typeof root === "object" && !Array.isArray(root) && "packs" in root
        ? (root as { packs: unknown }).packs
        : null;
  if (!Array.isArray(raw)) return [];
  return raw.map((row): CreditPack => {
    const o = row as Record<string, unknown>;
    const id = typeof o._id === "string" ? o._id : typeof o.id === "string" ? o.id : "";
    const name = typeof o.name === "string" ? o.name : "";
    const credits = typeof o.credits === "number" && Number.isFinite(o.credits) ? o.credits : 0;
    const bonusCredits =
      typeof o.bonusCredits === "number" && Number.isFinite(o.bonusCredits) ? o.bonusCredits : 0;
    const priceGel =
      typeof o.priceGel === "number" && Number.isFinite(o.priceGel)
        ? o.priceGel
        : typeof o.price_gel === "number" && Number.isFinite(o.price_gel)
          ? o.price_gel
          : 0;
    return { _id: id, name, credits, bonusCredits, priceGel };
  });
}

export async function purchaseCredits(packId: string): Promise<{ paymentUrl: string }> {
  const res = await authFetch(`${api("/credits/purchase")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packId }),
  });
  const json = await readJsonSafe(res);
  if (res.status === 429) {
    throw new Error(extractMessage(json, "Too many requests. Please wait and try again."));
  }
  if (!res.ok) throw new Error(extractMessage(json, "Failed to start purchase"));
  const inner = (json.data ?? json) as Record<string, unknown>;
  const paymentUrlRaw =
    inner.paymentUrl ?? inner.payment_url ?? json.paymentUrl ?? json.payment_url;
  const paymentUrl =
    typeof paymentUrlRaw === "string" && paymentUrlRaw.trim() ? paymentUrlRaw.trim() : "";
  if (!paymentUrl) throw new Error("No payment URL returned from server");
  return { paymentUrl };
}

/* ========== Admin ========== */

function adminFetch(path: string, init?: RequestInit) {
  return authFetch(api(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await adminFetch("/admin/stats");
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch stats");
  return json.data ?? json;
}

export async function getAdminUsers(params?: {
  status?: "active" | "blocked" | "new";
}): Promise<AdminUser[]> {
  const q = params?.status ? `?status=${params.status}` : "";
  const res = await adminFetch(`/admin/users${q}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch users");
  const data = json.data ?? json;
  return Array.isArray(data) ? data : [];
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  const res = await adminFetch(`/admin/users/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "User not found");
  return json.data ?? json;
}

export async function blockAdminUser(id: string): Promise<void> {
  const res = await adminFetch(`/admin/users/${id}/block`, { method: "PUT" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to block user");
}

export async function unblockAdminUser(id: string): Promise<void> {
  const res = await adminFetch(`/admin/users/${id}/unblock`, { method: "PUT" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to unblock user");
}

export async function getAdminMasters(): Promise<AdminMaster[]> {
  const res = await adminFetch("/admin/masters");
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch masters");
  const data = json.data ?? json;
  return Array.isArray(data) ? data : [];
}

export async function getAdminMaster(id: string): Promise<AdminMaster> {
  const res = await adminFetch(`/admin/masters/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Master not found");
  return json.data ?? json;
}

export async function createAdminMaster(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  specialty?: string;
  location?: string;
}): Promise<AdminMaster> {
  const res = await adminFetch("/admin/masters", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create master");
  return json.data ?? json;
}

export async function blockAdminMaster(id: string): Promise<void> {
  const res = await adminFetch(`/admin/masters/${id}/block`, { method: "PUT" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to block master");
}

export async function unblockAdminMaster(id: string): Promise<void> {
  const res = await adminFetch(`/admin/masters/${id}/unblock`, {
    method: "PUT",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to unblock master");
}

export async function getAdminMasterCreditBalance(masterId: string): Promise<{ balance: number }> {
  const q = new URLSearchParams();
  q.set("masterId", masterId);
  const res = await adminFetch(`/admin/credits/balance?${q.toString()}`, { method: "GET" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load master credit balance"));
  const inner = (json.data ?? json) as Record<string, unknown>;
  const raw = inner.balance ?? inner.currentBalance;
  const balance = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
  return { balance };
}

export async function getAdminMasterCreditHistory(
  masterId: string,
  page = 1,
  limit = 20,
): Promise<CreditHistoryResult> {
  const q = new URLSearchParams();
  q.set("masterId", masterId);
  q.set("page", String(page));
  q.set("limit", String(limit));
  const res = await adminFetch(`/admin/credits/history?${q.toString()}`, { method: "GET" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load master credit history"));
  const inner = (json.data ?? json) as Record<string, unknown>;
  const transactionsRaw = inner.transactions;
  const transactions = Array.isArray(transactionsRaw)
    ? (transactionsRaw as CreditTransaction[])
    : [];
  const total =
    typeof inner.total === "number" && Number.isFinite(inner.total)
      ? inner.total
      : transactions.length;
  const pageNum = typeof inner.page === "number" && Number.isFinite(inner.page) ? inner.page : page;
  const pages =
    typeof inner.pages === "number" && Number.isFinite(inner.pages)
      ? inner.pages
      : Math.max(1, Math.ceil(total / limit));
  return { transactions, total, page: pageNum, pages };
}

export async function adjustAdminMasterCredits(input: {
  masterId: string;
  amount: number;
  note?: string;
}): Promise<void> {
  const res = await adminFetch("/admin/credits/adjust", {
    method: "POST",
    body: JSON.stringify({
      masterId: input.masterId,
      amount: input.amount,
      note: input.note?.trim() || undefined,
    }),
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to adjust credits"));
}

export async function registerAdmin(
  data: AdminRegisterInput,
): Promise<AuthResponse> {
  const res = await fetch(`${api("/auth/admin/register")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      adminSecret: data.adminSecret,
    }),
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Admin registration failed");
  return json;
}
