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
  CreditHistoryResult,
  CreditTransaction,
  SpendCreditsResult,
  CreditPack,
} from "./types";
import { InsufficientCreditsError } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/** No trailing slash. Legacy `/uploads/...` paths resolve here + path, or stay root-relative for Next `/uploads` rewrite. */
const FRONTEND_ORIGIN = (process.env.NEXT_PUBLIC_FRONTEND_URL || "").replace(/\/$/, "");

/** @deprecated Use cookie auth; kept for migration. Returns null when using HTTP-only cookies. */
export function getStoredToken(): string | null {
  return null;
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
  let res = await fetch(url, { ...init, credentials: "include" as RequestCredentials });
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new Error("Session expired. Please log in again.");
    init = getInit();
    res = await fetch(url, { ...init, credentials: "include" as RequestCredentials });
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
  return typeof maybeMessage === "string" && maybeMessage.trim() ? maybeMessage : fallback;
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
  try {
    await fetch(`${api("/auth/logout")}`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    if (typeof window !== "undefined") localStorage.removeItem("mipove_token");
  }
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
    rating?: number;
    reviewCount?: number;
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
  const res = await fetch(`${api("/masters/professions")}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failet to get professions");
  return json.data ?? json as Professions[];
}
export async function searchCities(query: string, count = 10): Promise<GeocodeCity[]> {
  if (!query || query.trim().length < 2) return [];
  const q = encodeURIComponent(query.trim());
  const url = `${api("/geocode/search")}?q=${q}&count=${count}`;
  const res = await fetch(url);
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
  const res = await fetch(api(`/masters${q}`));
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch masters");
  const data = json.data ?? json;
  return Array.isArray(data) ? data : [];
}

export async function getProfileBySlug(slug: string): Promise<{
  name: string;
  specialty: string;
  location: string;
  bio: string;
  rating?: number;
  reviewCount?: number;
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
  const res = await fetch(`${api(`/masters/${slug}`)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Profile not found");
  const data = json.data ?? json;
  return {
    ...data,
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
    rating?: number;
    reviewCount?: number;
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
  return {
    data: {
      stars: typeof inner.stars === "number" ? inner.stars : undefined,
      rating: typeof inner.rating === "number" ? inner.rating : undefined,
      reviewCount: typeof inner.reviewCount === "number" ? inner.reviewCount : undefined,
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

export async function createOrder(data: OrderUpsertInput): Promise<OrderRecord> {
  const res = await authFetch(`${api("/orders")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to create order"));
  const raw = (json.data ?? json) as OrderRecord;
  return { ...raw, attachments: Array.isArray(raw.attachments) ? raw.attachments : [] };
}

export async function getOrders(): Promise<OrderRecord[]> {
  const res = await authFetch(`${api("/orders")}`, { method: "GET" });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load orders"));
  const data = (json.data ?? json) as unknown;
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const order = row as OrderRecord;
    return {
      ...order,
      attachments: Array.isArray(order.attachments) ? order.attachments : [],
    };
  });
}

export async function getOrderById(orderId: string): Promise<OrderRecord> {
  const res = await authFetch(`${api(`/orders/${encodeURIComponent(orderId)}`)}`, {
    method: "GET",
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load order"));
  const order = (json.data ?? json) as OrderRecord;
  return { ...order, attachments: Array.isArray(order.attachments) ? order.attachments : [] };
}

export async function updateOrder(orderId: string, data: OrderUpsertInput): Promise<OrderRecord> {
  const res = await authFetch(`${api(`/orders/${encodeURIComponent(orderId)}`)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to update order"));
  const order = (json.data ?? json) as OrderRecord;
  return { ...order, attachments: Array.isArray(order.attachments) ? order.attachments : [] };
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
  const data = (json.data ?? json) as unknown;
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const order = row as OrderRecord;
    return {
      ...order,
      attachments: Array.isArray(order.attachments) ? order.attachments : [],
    };
  });
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
    throw new InsufficientCreditsError(
      extractMessage(json, "Insufficient credits"),
      required,
      balance,
    );
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
  const res = await fetch(`${api("/credits/packs")}`);
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(extractMessage(json, "Failed to load credit packs"));
  const inner = json.data ?? json;
  const raw =
    inner != null && typeof inner === "object" && !Array.isArray(inner) && "packs" in inner
      ? (inner as { packs: unknown }).packs
      : inner;
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
