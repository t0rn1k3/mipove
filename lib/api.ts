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
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const IMAGE_BASE = API_URL.replace(/\/api\/?$/, "") || "http://localhost:5000";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mipove_token");
}

export function storeToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("mipove_token", token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("mipove_token");
}

export function getImageUrl(path: string | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${IMAGE_BASE}${path}`;
  return path;
}

const api = (path: string) =>
  `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  const res = await fetch(`${api("/auth/users/register")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, phone: data.phone || "" }),
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
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json;
}

export async function logout(): Promise<void> {
  clearToken();
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
    ratedMasters?: RatedMasterItem[];
  };
}> {
  const token = getStoredToken();
  if (!token) throw new Error("Not logged in");
  const res = await fetch(`${api("/auth/me")}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to get user");
  return json;
}

export async function getProfile(): Promise<Awaited<ReturnType<typeof getMe>>> {
  const token = getStoredToken();
  if (!token) throw new Error("Not logged in");
  const res = await fetch(`${api("/auth/profile")}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to get profile");
  return json;
}

export async function getMasters(params?: {
  specialty?: string;
  search?: string;
}): Promise<MasterListItem[]> {
  const searchParams = new URLSearchParams();
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
    works: (data.works ?? []).map((w: { _id?: string; id?: string }) => ({
      ...w,
      id: w._id ?? w.id ?? "",
    })),
  };
}

export async function updateProfile(
  data: UpdateProfileInput,
): Promise<{ data: Awaited<ReturnType<typeof getMe>>["data"] }> {
  const token = getStoredToken();
  if (!token) throw new Error("Not logged in");
  const res = await fetch(`${api("/auth/me")}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Update failed");
  return json;
}

export async function uploadProfileImage(
  file: File,
): Promise<{ data: Awaited<ReturnType<typeof getMe>>["data"] }> {
  const form = new FormData();
  form.append("image", file);

  const token = getStoredToken();
  const res = await fetch(`${api("/auth/me")}`, {
    method: "PATCH",
    body: form,
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  return json;
}

/* ========== Admin ========== */

function adminFetch(path: string, init?: RequestInit) {
  const token = getStoredToken();
  if (!token) throw new Error("Not logged in");
  return fetch(api(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Admin registration failed");
  return json;
}
