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
  token?: string; // Optional when using HTTP-only cookie auth
  message?: string;
  user?: User;
  data?: { role?: string; slug?: string; id?: string };
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
  portfolioImages?: string[];
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

/* ========== Rated Masters (User Profile) ========== */

export type RatedMasterItem = {
  master: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    specialty?: string;
    location?: string;
  };
  stars: number;
  ratedAt: string;
};

/* ========== Masters List ========== */

export type MasterListItem = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  specialty?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  email?: string;
  instagram?: string;
};

/* ========== Profile Update ========== */

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

/* ========== Admin ========== */

export type AdminStats = {
  users?: number;
  masters?: number;
  totalUsers?: number;
  totalMasters?: number;
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  blocked?: boolean;
  createdAt?: string;
};

export type AdminMaster = AdminUser & {
  slug?: string;
  specialty?: string;
  location?: string;
  bio?: string;
  image?: string;
};

export type AdminRegisterInput = {
  name: string;
  email: string;
  password: string;
  adminSecret: string;
};

/* ========== Geocode ========== */

export type GeocodeCity = {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  displayName: string;
};

/* ========== API Error ========== */

export type ApiErrorResponse = {
  message: string;
  statusCode?: number;
  error?: string;
};
