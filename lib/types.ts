/* ========== Auth ========== */

export type RegisterInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  message?: string;
  user?: User;
  data?: { role?: string };
};

/* ========== User / Master ========== */

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "master";
  createdAt?: string;
  updatedAt?: string;
};

export type Master = User & {
  specialty?: string;
  location?: string;
  bio?: string;
  image?: string;
  slug?: string;
  works?: Work[];
};

/* ========== Artisan / Portfolio ========== */

export type Work = {
  id: string;
  title: string;
  description?: string;
  image: string;
};

export type Artisan = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  bio: string;
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
  image: string;
  slug: string;
  works: Work[];
  createdAt?: string;
  updatedAt?: string;
};

/* ========== API Error ========== */

export type ApiErrorResponse = {
  message: string;
  statusCode?: number;
  error?: string;
};
