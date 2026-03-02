import type { AuthResponse, LoginInput, RegisterInput } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register/user`, {
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
  const res = await fetch(`${API_URL}/auth/register/master`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, phone: data.phone || "" }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json;
}

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

export function getAuthRedirectPath(json: {
  data?: { role?: string; slug?: string };
  user?: { role?: string; slug?: string };
}): string {
  const data = json.data ?? json.user;
  const role = data?.role;
  if (role === "admin") return "/admin";
  if (role === "master" && data?.slug) return `/profile/${data.slug}`;
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
    works?: Array<{ id: string; title: string; description?: string; image: string }>;
  };
}> {
  const token = getStoredToken();
  if (!token) throw new Error("Not logged in");
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to get user");
  return json;
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
  works: Array<{ id: string; title: string; description?: string; image: string }>;
}> {
  const res = await fetch(`${API_URL}/profile/${slug}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Profile not found");
  return json;
}

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  location?: string;
  bio?: string;
  image?: string;
  instagram?: string;
  website?: string;
};

export async function updateProfile(
  data: UpdateProfileInput
): Promise<{ data: Awaited<ReturnType<typeof getMe>>["data"] }> {
  const token = getStoredToken();
  if (!token) throw new Error("Not logged in");
  const res = await fetch(`${API_URL}/auth/me`, {
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
