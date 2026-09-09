import type { Business, Review, VendorStore } from "@nusa/db";

/**
 * Public directory responses must never leak ownership internals, customer
 * bookings, or review author contact details. Prefer explicit allowlists so
 * new private fields default to omitted.
 *
 * List/search/discovery use the card shape. Listing detail adds profile fields
 * the visitor page actually renders (including bookingMode for the request
 * form). Cards omit bookingMode so nearby HTML JSON is not internal jargon.
 */

/** Drafts are portal-only; published and claimed listings are directory-visible. */
export function isPubliclyListed(business: Business): boolean {
  return business.status !== "draft";
}

/** Directory card: island/place lists, search, nearby neighbours. */
export type PublicBusinessCard = {
  id: string;
  placeId: string;
  slug: string;
  name: string;
  categories: string[];
  summary: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  lat?: number;
  lng?: number;
  sample?: boolean;
  verifiedAt?: string;
  /** True when a field agent registered the listing; never the agent user id. */
  fieldRegistered?: boolean;
  facets?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
};

export type PublicBusiness = PublicBusinessCard & {
  status: Business["status"];
  description: string;
  gallery: string[];
  videoUrl?: string;
  social?: Record<string, string>;
  openingHours: Business["openingHours"];
  faq: Business["faq"];
  bookingMode: Business["bookingMode"];
  facets?: Record<string, string[]>;
};

export function toPublicBusinessCard(business: Business): PublicBusinessCard {
  return {
    id: business.id,
    placeId: business.placeId,
    slug: business.slug,
    name: business.name,
    categories: business.categories,
    summary: business.summary,
    address: business.address,
    phone: business.phone,
    whatsapp: business.whatsapp,
    website: business.website,
    lat: business.lat,
    lng: business.lng,
    sample: business.sample === true ? true : undefined,
    verifiedAt: business.verifiedAt,
    fieldRegistered: business.registeredByAgentId ? true : undefined,
    facets: business.facets,
    createdAt: business.createdAt,
    updatedAt: business.updatedAt,
  };
}

export function toPublicBusiness(business: Business): PublicBusiness {
  return {
    ...toPublicBusinessCard(business),
    status: business.status,
    description: business.description,
    gallery: business.gallery,
    videoUrl: business.videoUrl,
    social: business.social,
    openingHours: business.openingHours,
    faq: business.faq,
    bookingMode: business.bookingMode,
  };
}

export type PublicNeighbor = {
  business: PublicBusinessCard;
  place: { slug: string; name: string };
  island: { slug: string; name: string };
  geo?: { hostPlace: string; area?: string };
  distanceKm: number;
};

export function toPublicNeighbor(n: {
  business: Business;
  place: { slug: string; name: string };
  island: { slug: string; name: string };
  geo?: { hostPlace: string; area?: string };
  distanceKm: number;
}): PublicNeighbor {
  return {
    business: toPublicBusinessCard(n.business),
    place: { slug: n.place.slug, name: n.place.name },
    island: { slug: n.island.slug, name: n.island.name },
    geo: n.geo,
    distanceKm: Math.round(n.distanceKm * 100) / 100,
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
