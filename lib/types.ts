import type { FormEventHandler, ReactNode } from "react";

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
  projectsCount?: number;
  skills?: string[];
  bio?: string;
  description?: string;
};

/* ========== Orders page ========== */

export type OrdersPageSessionUser = {
  id?: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  slug?: string;
};

export type OrderStatus = "pending" | "active" | "completed" | "cancelled";

export type OrderRecord = {
  _id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  priceNegotiable: boolean;
  deadline: string;
  status: OrderStatus;
  attachments: string[];
  expectedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  publisher?: {
    _id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
};

/** Public list from GET /orders/categories */
export type OrderCategoryOption = {
  id: string;
  label: string;
};

export type OrderUpsertInput = {
  title: string;
  /** Canonical category id from GET /orders/categories; omit, empty string, or null to clear (PATCH). */
  category?: string | null;
  description: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  priceNegotiable: boolean;
  deadline: string;
  attachments: string[];
};

/* ========== Credits ========== */

export type CreditTransaction = {
  _id: string;
  type: "grant" | "purchase" | "spend" | "refund" | "admin_adjust";
  amount: number;
  balanceAfter: number;
  action: string;
  metadata?: { orderId?: string; packId?: string; note?: string };
  createdAt: string;
};

export type CreditHistoryResult = {
  transactions: CreditTransaction[];
  total: number;
  page: number;
  pages: number;
};

export type CreditPack = {
  _id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  priceGel: number;
};

export type SpendCreditsResult = {
  success: boolean;
  remaining: number;
  data?: { phone?: string; email?: string };
};

export class InsufficientCreditsError extends Error {
  required: number;
  balance: number;
  constructor(message: string, required: number, balance: number) {
    super(message);
    this.required = required;
    this.balance = balance;
  }
}

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

/* ========== Profile page (client) ========== */

export type ProfileData = {
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
  portfolioImages: string[];
  works: Work[];
};

/** Fields from GET /me (or similar) consumed by mapMeToProfile */
export type MeProfileApiFields = {
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  location?: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  instagram?: string;
  website?: string;
  works?: Work[];
  portfolioImages?: string[];
};

/* ========== Admin UI ========== */

export type AdminUsersFilterStatus = "all" | "active" | "blocked" | "new";

/* ========== UI: Components ========== */

export type PortfolioSectionProps = {
  portfolioImages: string[];
  onPortfolioImagesChange: (images: string[]) => void;
  userRole: string | null;
  isOwnProfile: boolean;
  onOpenPortfolio: (index: number) => void;
};

export type MasterRatingSectionProps = {
  isMasterProfile: boolean;
  rating?: number;
  reviewCount?: number;
  isOwnProfile: boolean;
  slug?: string;
  canVoteRole: boolean;
  userRole: string | null;
  rateInitialStars: number | null;
  onRateSubmit: (stars: number) => Promise<void>;
};

export type PortfolioLightboxProps = {
  images: string[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
  onClose: () => void;
  title?: string;
};

export type EditProfileValues = {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  location: string;
  bio: string;
  instagram?: string;
  website?: string;
};

export type EditProfileModalProps = {
  open: boolean;
  values: EditProfileValues;
  editError: string;
  editLoading: boolean;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export type RatedMastersListProps = {
  ratedMasters: RatedMasterItem[];
};

export type SelectOption = {
  value: string;
  label: string;
};

export type CustomSelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

export type MasterCardProps = {
  master: MasterListItem;
  delay?: number;
  canRate?: boolean;
  myRating?: number | null;
  onRate?: (masterSlug: string, stars: number) => Promise<void>;
};

export type NavbarUserInfo = {
  name: string;
  image?: string;
  role: string;
  slug?: string;
} | null;

export type AppLocale = "en" | "ka";

export type LocaleProviderProps = {
  initialLocale: AppLocale;
  enMessages: Record<string, unknown>;
  kaMessages: Record<string, unknown>;
  children: ReactNode;
};

export type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

export type ProfileSidebarProps = {
  name: string;
  specialty: string;
  location: string;
  bio: string;
  rating?: number;
  reviewCount?: number;
  credits?: number;
  phone: string;
  email: string;
  instagram?: string;
  website?: string;
  image: string;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onLogout?: () => void;
  onChangePhoto?: (file: File) => void;
  isUploadingPhoto?: boolean;
  /** Master: opens buy-credits flow (e.g. modal). */
  onBuyCredits?: () => void;
};

export type LogoProps = {
  size?: number;
  showText?: boolean;
  asLink?: boolean;
  className?: string;
};

export type CityAutocompleteProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string, city: GeocodeCity) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export type LightboxModalBaseProps = {
  onClose: () => void;
};

export type LightboxModalSingleProps = LightboxModalBaseProps & {
  image: string;
  title: string;
  description?: string;
};

export type LightboxModalGalleryProps = LightboxModalBaseProps & {
  images: string[];
  index: number;
  onIndexChange: (nextIndex: number) => void;
  title?: string;
};

export type LightboxModalProps =
  | LightboxModalSingleProps
  | LightboxModalGalleryProps;

export type Professions = {
  id: string;
  label: string;
};