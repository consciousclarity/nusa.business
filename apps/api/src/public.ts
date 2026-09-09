import type { Business, Review, VendorStore } from "@nusa/db";

/**
 * Public directory responses must never leak ownership internals, customer
 * bookings, or review author contact details. Prefer explicit allowlists so
 * new private fields default to omitted.
 */

/** Drafts are portal-only; published and claimed listings are directory-visible. */
export function isPubliclyListed(business: Business): boolean {
  return business.status !== "draft";
}

export type PublicBusiness = {
  id: string;
  placeId: string;
  slug: string;
  name: string;
  status: Business["status"];
  categories: string[];
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
  openingHours: Business["openingHours"];
  faq: Business["faq"];
  bookingMode: Business["bookingMode"];
  vendorId?: string;
  facets?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
};

export function toPublicBusiness(business: Business): PublicBusiness {
  return {
    id: business.id,
    placeId: business.placeId,
    slug: business.slug,
    name: business.name,
    status: business.status,
    categories: business.categories,
    summary: business.summary,
    description: business.description,
    address: business.address,
    phone: business.phone,
    whatsapp: business.whatsapp,
    website: business.website,
    lat: business.lat,
    lng: business.lng,
    gallery: business.gallery,
    videoUrl: business.videoUrl,
    social: business.social,
    openingHours: business.openingHours,
    faq: business.faq,
    bookingMode: business.bookingMode,
    vendorId: business.vendorId,
    facets: business.facets,
    createdAt: business.createdAt,
    updatedAt: business.updatedAt,
  };
}

export type PublicReview = {
  id: string;
  businessId: string;
  authorName: string;
  service: number;
  value: number;
  location: number;
  cleanliness: number;
  comment: string;
  createdAt: string;
};

export function toPublicReview(review: Review): PublicReview {
  return {
    id: review.id,
    businessId: review.businessId,
    authorName: review.authorName,
    service: review.service,
    value: review.value,
    location: review.location,
    cleanliness: review.cleanliness,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

/** Storefront fields only — no ownership metadata beyond the linked business. */
export function toPublicVendor(vendor: VendorStore): VendorStore {
  return {
    id: vendor.id,
    businessId: vendor.businessId,
    name: vendor.name,
    slug: vendor.slug,
    description: vendor.description,
    commissionPercent: vendor.commissionPercent,
    products: vendor.products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      currency: p.currency,
      stock: p.stock,
      description: p.description,
    })),
    createdAt: vendor.createdAt,
  };
}
