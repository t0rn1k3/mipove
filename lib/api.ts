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
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const IMAGE_BASE = API_URL.replace(/\/api\/?$/, "") || "http://localhost:5000";

/** @deprecated Use cookie auth; kept for migration. Returns null when using HTTP-only cookies. */
export function getStoredToken(): string | null {
  return null;
}

export function getImageUrl(path: string | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${IMAGE_BASE}${path}`;
  return path;
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
