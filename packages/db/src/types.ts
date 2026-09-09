import type {
  BookingMode,
  BusinessStatus,
  ClaimStatus,
  PlaceType,
  UserRole,
} from "@nusa/shared";

export type Island = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  status: "active" | "coming_soon";
};

export type Place = {
  id: string;
  islandId: string;
  slug: string;
  name: string;
  type: PlaceType;
  parentPlaceId?: string;
  summary: string;
};

export type OpeningHours = {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
};

export type Business = {
  id: string;
  placeId: string;
  slug: string;
  name: string;
  status: BusinessStatus;
  categories: string[]; // canonical taxonomy slugs (@nusa/shared)
  summary: string;
  description: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  lat?: number;
  lng?: number;
  gallery: string[];
  videoUrl?: string;
  social?: Record<string, string>;
  openingHours: OpeningHours[];
  faq: { q: string; a: string }[];
  bookingMode: BookingMode;
  ownerUserId?: string;
  vendorId?: string;
  registeredByAgentId?: string;
  /** Directory filters: facet key → value slugs. Geo location is the host, not stored here. */
  facets?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
};

export type Claim = {
  id: string;
  businessId: string;
  claimantUserId: string;
  status: ClaimStatus;
  /** Claimant evidence / note for operators — not shown publicly. */
  note?: string;
  createdAt: string;
  decidedByUserId?: string;
  decidedAt?: string;
  decisionReason?: string;
};

/** Admin-issued signup invite (launch path — no open self-registration). */
export type Invite = {
  id: string;
  email: string;
  role: UserRole;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string;
  createdByUserId: string;
  createdAt: string;
  /** Optional listing to resume after register/login. */
  businessId?: string;
};

/** Single-use password recovery token. */
export type RecoveryToken = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
};

export type Review = {
  id: string;
  businessId: string;
  authorName: string;
  authorEmail?: string;
  service: number;
  value: number;
  location: number;
  cleanliness: number;
  comment: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  businessId: string;
  mode: Exclude<BookingMode, "none">;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  /** ISO date for rental/event, or date+slot for service */
  startDate: string;
  endDate?: string;
  timeSlot?: string;
  guests?: number;
  tickets?: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
};

export type VendorStore = {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  description: string;
  commissionPercent: number;
  products: VendorProduct[];
  createdAt: string;
};

export type VendorProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  stock: number;
  description: string;
};

export type DataStore = {
  islands: Island[];
  places: Place[];
  businesses: Business[];
  users: User[];
  claims: Claim[];
  reviews: Review[];
  bookings: Booking[];
  vendors: VendorStore[];
  invites: Invite[];
  recoveryTokens: RecoveryToken[];
};
